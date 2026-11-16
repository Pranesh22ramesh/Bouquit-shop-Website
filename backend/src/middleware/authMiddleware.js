const { prisma } = require('../config/prisma');
const { verifyAccessToken } = require('../utils/token');
const { ApiError } = require('../utils/apiError');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next(new ApiError(401, 'Not authorized, no token'));

  let payload;
  try { payload = verifyAccessToken(token); } catch (_) {
    return next(new ApiError(401, 'Not authorized, token failed'));
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) return next(new ApiError(401, 'User not found'));
    if (user.isActive === false) return next(new ApiError(403, 'Your account has been disabled'));

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'SUBADMIN') return next();
  return next(new ApiError(403, 'Admin access required'));
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next();

  let payload;
  try { payload = verifyAccessToken(token); } catch (_) {
    req.user = null;
    return next();
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    req.user = user?.isActive === false ? null : user || null;
  } catch (error) {
    return next(error);
  }

  return next();
};

module.exports = { protect, adminOnly, optionalAuth };
