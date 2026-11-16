const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email, type: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`,
    jwtid: crypto.randomUUID(),
  });

const signResetToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, type: 'reset' }, env.jwtResetSecret, {
    expiresIn: '30m',
    jwtid: crypto.randomUUID(),
  });

const verifyToken = (token, secret, type) => {
  if (typeof token !== 'string' || token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new jwt.JsonWebTokenError('Invalid token format');
  }
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  if (typeof payload !== 'object' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(payload.sub || '') ||
      payload.type !== type || !Number.isInteger(payload.exp)) {
    throw new jwt.JsonWebTokenError('Invalid token claims');
  }
  return payload;
};
const verifyAccessToken = (token) => verifyToken(token, env.jwtAccessSecret, undefined);
const verifyRefreshToken = (token) => verifyToken(token, env.jwtRefreshSecret, 'refresh');
const verifyResetToken = (token) => verifyToken(token, env.jwtResetSecret, 'reset');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
  hashToken,
};
