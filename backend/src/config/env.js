const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

// Validate critical secrets in production to prevent running with insecure defaults
if (nodeEnv === 'production') {
  const insecureSecrets = [];
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.includes('replace-')) {
    insecureSecrets.push('JWT_ACCESS_SECRET');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('replace-')) {
    insecureSecrets.push('JWT_REFRESH_SECRET');
  }
  if (insecureSecrets.length > 0) {
    console.error(`[CRITICAL SECURITY WARNING] Missing production secrets: ${insecureSecrets.join(', ')}`);
  }
}

const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'site-assets',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-for-local-only-do-not-use-in-prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-for-local-only-do-not-use-in-prod',
  jwtResetSecret: process.env.JWT_RESET_SECRET || 'dev-reset-secret-for-local-only-do-not-use-in-prod',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'bb_refresh_token',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  adminEmail: (process.env.ADMIN_EMAIL || 'midhunyas2012karur@gmail.com').toLowerCase(),
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
