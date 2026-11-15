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
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(uploadDir)) {
  throw new Error('UPLOAD_DIR must be a simple directory name');
}

const positiveInteger = (name, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    throw new Error(`${name} must be a positive integer no greater than ${max}`);
  }
  return value;
};

const nonnegativeInteger = (name, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0 || value > max) {
    throw new Error(`${name} must be a non-negative integer no greater than ${max}`);
  }
  return value;
};

const booleanFromEnv = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  if (/^(true|1)$/i.test(raw)) return true;
  if (/^(false|0)$/i.test(raw)) return false;
  throw new Error(`${name} must be true or false`);
};

const env = {
  nodeEnv,
  port: positiveInteger('PORT', 5000, 65535),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  trustProxyHops: nonnegativeInteger('TRUST_PROXY_HOPS', nodeEnv === 'production' ? 1 : 0, 10),
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseStorageEnabled: booleanFromEnv('SUPABASE_STORAGE_ENABLED', true),
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'site-assets',
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtResetSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'bb_refresh_token',
  uploadDir,
  upload: {
    maxFileBytes: positiveInteger('UPLOAD_MAX_FILE_BYTES', 10 * 1024 * 1024),
    maxFilesPerRequest: positiveInteger('UPLOAD_MAX_FILES_PER_REQUEST', 8, 50),
    maxFieldsPerRequest: positiveInteger('UPLOAD_MAX_FIELDS_PER_REQUEST', 40, 200),
    maxFieldBytes: positiveInteger('UPLOAD_MAX_FIELD_BYTES', 128 * 1024, 2 * 1024 * 1024),
    maxImagePixels: positiveInteger('UPLOAD_MAX_IMAGE_PIXELS', 40000000),
  },
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',

  // Configurable Rate Limiting Thresholds (all overridable via env vars)
  rateLimit: {
    globalWindowMs: positiveInteger('RATE_LIMIT_GLOBAL_WINDOW_MS', 15 * 60 * 1000),
    globalMax: positiveInteger('RATE_LIMIT_GLOBAL_MAX', 300),

    publicWindowMs: positiveInteger('RATE_LIMIT_PUBLIC_WINDOW_MS', 15 * 60 * 1000),
    publicMax: positiveInteger('RATE_LIMIT_PUBLIC_MAX', 200),

    authWindowMs: positiveInteger('RATE_LIMIT_AUTH_WINDOW_MS', 15 * 60 * 1000),
    authMax: positiveInteger('RATE_LIMIT_AUTH_MAX', 10),
    authAccountFailureMax: positiveInteger('RATE_LIMIT_AUTH_ACCOUNT_FAILURE_MAX', 3),
    authIpFailureMax: positiveInteger('RATE_LIMIT_AUTH_IP_FAILURE_MAX', 5),
    authBackoffBaseMs: positiveInteger('RATE_LIMIT_AUTH_BACKOFF_BASE_MS', 1500),
    authBackoffMaxMs: positiveInteger('RATE_LIMIT_AUTH_BACKOFF_MAX_MS', 60000),
    authAttemptMapMaxEntries: positiveInteger('RATE_LIMIT_AUTH_ATTEMPT_MAP_MAX_ENTRIES', 20000),

    signupWindowMs: positiveInteger('RATE_LIMIT_SIGNUP_WINDOW_MS', 60 * 60 * 1000),
    signupMax: positiveInteger('RATE_LIMIT_SIGNUP_MAX', 5),

    userWindowMs: positiveInteger('RATE_LIMIT_USER_WINDOW_MS', 15 * 60 * 1000),
    userMax: positiveInteger('RATE_LIMIT_USER_MAX', 500),

    uploadWindowMs: positiveInteger('RATE_LIMIT_UPLOAD_WINDOW_MS', 15 * 60 * 1000),
    uploadMax: positiveInteger('RATE_LIMIT_UPLOAD_MAX', 30),
  },
};

module.exports = { env };
