// Read-only deployment check. Never print connection strings, passwords or query results.
require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
(async () => {
  for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
    let url;
    try { url = new URL(process.env[name]); } catch { console.log(`${name}: missing or invalid`); process.exitCode = 1; continue; }
    url.searchParams.set('connect_timeout', '5');
    const client = new PrismaClient({ datasources: { db: { url: url.href } }, log: [] });
    try {
      await client.$connect();
      const [result] = await client.$queryRaw`SELECT 1 AS connected`;
      const columns = await client.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'authVersion'`;
      const security = await client.$queryRaw`SELECT relname, relrowsecurity FROM pg_class JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid WHERE nspname = 'public' AND relname IN ('User','Order','RefreshToken','PasswordResetToken','CartItem','Like','WishlistItem','ActivityLog')`;
      console.log(JSON.stringify({ connection: name, connected: result.connected === 1, tlsRequested: ['require', 'verify-full'].includes(url.searchParams.get('sslmode')), sessionVersionColumn: columns.length === 1, privateTablesWithRls: security.filter((row) => row.relrowsecurity).length, expectedPrivateTables: 8, readOnly: true }));
    } catch (error) { console.log(JSON.stringify({ connection: name, connected: false, code: error.errorCode || error.code || 'CONNECTION_FAILED', changed: false })); process.exitCode = 1; }
    finally { await client.$disconnect(); }
  }
})();
