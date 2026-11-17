const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const allowedOrigins = new Set([env.frontendUrl, ...(process.env.CORS_ORIGINS || '').split(',').filter(Boolean)].map((value) => {
  const url = new URL(value.trim());
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('CORS origins must be bare origins');
  if (env.nodeEnv === 'production' && url.protocol !== 'https:') throw new Error('Production CORS origins must use HTTPS');
  return url.origin;
}));
const isAllowedOrigin = (origin) => allowedOrigins.has(origin) || (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
const requestSecurity = (req, res, next) => {
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
  // Cross-origin forms cannot set this header. CORS admits only exact trusted origins.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && /^\/api\/auth(?:\/|$)/i.test(req.path)) {
    if (req.get('X-Requested-With') !== 'shop-web' || (req.get('Origin') && !isAllowedOrigin(req.get('Origin')))) {
      return next(new ApiError(403, 'Request origin could not be verified'));
    }
  }
  next();
};
module.exports = { isAllowedOrigin, requestSecurity };
