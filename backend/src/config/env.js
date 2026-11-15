const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

const secret = (name) => {
  const value = process.env[name];
  if (nodeEnv === 'production' && (!value || value.length < 32 || /generate|replace|example|placeholder/i.test(value))) {
    throw new Error(`${name} must be set to a unique random value of at least 32 characters in production`);
  }
  return value || crypto.randomBytes(48).toString('hex');
};

const jwtAccessSecret = secret('JWT_ACCESS_SECRET');
const jwtRefreshSecret = secret('JWT_REFRESH_SECRET');
const jwtResetSecret = secret('JWT_RESET_SECRET');
if (nodeEnv === 'production' && new Set([jwtAccessSecret, jwtRefreshSecret, jwtResetSecret]).size !== 3) {
  throw new Error('JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and JWT_RESET_SECRET must be different values in production');
}

const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'site-assets',
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtResetSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'bb_refresh_token',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',

  // Configurable Rate Limiting Thresholds (all overridable via env vars)
  rateLimit: {
    globalWindowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || 15 * 60 * 1000),
    globalMax: Number(process.env.RATE_LIMIT_GLOBAL_MAX || 300),

    publicWindowMs: Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || 15 * 60 * 1000),
    publicMax: Number(process.env.RATE_LIMIT_PUBLIC_MAX || 200),

    authWindowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS || 15 * 60 * 1000),
    authMax: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),

    signupWindowMs: Number(process.env.RATE_LIMIT_SIGNUP_WINDOW_MS || 60 * 60 * 1000),
    signupMax: Number(process.env.RATE_LIMIT_SIGNUP_MAX || 5),

    userWindowMs: Number(process.env.RATE_LIMIT_USER_WINDOW_MS || 15 * 60 * 1000),
    userMax: Number(process.env.RATE_LIMIT_USER_MAX || 500),

    uploadWindowMs: Number(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS || 15 * 60 * 1000),
    uploadMax: Number(process.env.RATE_LIMIT_UPLOAD_MAX || 30),
  },
};

module.exports = { env };
