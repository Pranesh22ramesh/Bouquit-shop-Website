const { env } = require('../config/env');

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  path: '/api/auth',
  maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
};

module.exports = { refreshCookieOptions };
