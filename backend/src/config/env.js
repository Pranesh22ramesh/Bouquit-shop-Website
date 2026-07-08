const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'site-assets',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'replace-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'replace-refresh-secret',
  jwtResetSecret: process.env.JWT_RESET_SECRET || 'replace-reset-secret',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'bb_refresh_token',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  adminEmail: process.env.ADMIN_EMAIL || 'midhunyas2012karur@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Sudh@2012',
};

module.exports = { env };
