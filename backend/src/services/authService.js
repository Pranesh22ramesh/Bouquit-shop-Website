const bcrypt = require('bcryptjs');
const { Role } = require('@prisma/client');
const { prisma } = require('../config/prisma');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
} = require('../utils/token');
const { serializeUser } = require('../utils/serializers');
const userRepository = require('../repositories/userRepository');

const reserveAdminEmail = (email) => {
  if (String(email).toLowerCase() === env.adminEmail.toLowerCase()) {
    throw new ApiError(403, 'That email is reserved for the administrator account');
  }
};

const buildSession = async (user) => {
  if (user.isActive === false) {
    throw new ApiError(403, 'Your account has been disabled. Please contact the administrator.');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    },
  });

  return {
    token: accessToken,
    refreshToken,
    user: serializeUser(user),
  };
};

const seedAdminUser = async () => {
  await prisma.user.updateMany({
    where: {
      role: Role.ADMIN,
      email: { not: env.adminEmail.toLowerCase() },
    },
    data: { role: Role.USER },
  });

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  const existing = await prisma.user.findUnique({
    where: { email: env.adminEmail.toLowerCase() },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: existing.fullName || 'Administrator',
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    return;
  }

  await prisma.user.create({
    data: {
      fullName: 'Administrator',
      email: env.adminEmail.toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
};

const signup = async ({ fullName, email, phoneNumber, password }) => {
  reserveAdminEmail(email);

  const existing = await userRepository.findByEmail(email);
  if (existing) throw new ApiError(409, 'Email address is already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userRepository.createUser({
    fullName,
    email: String(email).toLowerCase(),
    phoneNumber: phoneNumber || null,
    passwordHash,
    role: Role.USER,
  });

  return buildSession(user);
};

const login = async ({ email, password, adminOnly = false }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new ApiError(401, 'Invalid email or password');
  if (user.isActive === false) {
    throw new ApiError(403, 'Your account has been disabled. Please contact the administrator.');
  }

  if (adminOnly) {
    const isAllowedAdmin = user.email === env.adminEmail.toLowerCase() && user.role === Role.ADMIN;
    if (!isAllowedAdmin) throw new ApiError(403, 'Only the configured administrator can access this area');
  }

  return buildSession(user);
};

const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawRefreshToken) },
    data: { revokedAt: new Date() },
  });
};

const refreshSession = async (rawRefreshToken) => {
  if (!rawRefreshToken) throw new ApiError(401, 'Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawRefreshToken) },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token has expired');
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User not found');
  if (user.isActive === false) {
    throw new ApiError(403, 'Your account has been disabled. Please contact the administrator.');
  }

  return buildSession(user);
};

const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isActive === false) throw new ApiError(403, 'Your account has been disabled');
  return serializeUser(user);
};

const beginPasswordReset = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return null;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = signResetToken(user);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  return rawToken;
};

const resetPassword = async ({ token, password }) => {
  let payload;
  try {
    payload = verifyResetToken(token);
  } catch (error) {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userRepository.updateUser(payload.sub, { passwordHash });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  return buildSession(user);
};

module.exports = {
  beginPasswordReset,
  getCurrentUser,
  login,
  logout,
  refreshSession,
  resetPassword,
  seedAdminUser,
  signup,
};
