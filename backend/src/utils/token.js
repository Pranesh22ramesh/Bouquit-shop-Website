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
  });

const signResetToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, type: 'reset' }, env.jwtResetSecret, {
    expiresIn: '30m',
  });

const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
const verifyResetToken = (token) => jwt.verify(token, env.jwtResetSecret);

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
