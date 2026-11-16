// Read-only by default. --apply changes the configured admin's password and revokes
// refresh/reset tokens. The generated password is saved only to ignored backend/.env.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { env } = require('../src/config/env');
const { prisma } = require('../src/config/prisma');

async function main() {
  if (!env.adminEmail || !env.adminPassword) throw new Error('Administrator configuration is missing');
  const user = await prisma.user.findUnique({ where: { email: env.adminEmail } });
  if (!user || user.role !== 'ADMIN') throw new Error('Configured administrator account was not found');
  const exposedPasswordStillValid = await bcrypt.compare(env.adminPassword, user.passwordHash);
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ accountExists: true, configuredPasswordStillValid: exposedPasswordStillValid, changed: false }));
    return;
  }
  const envPath = path.join(__dirname, '..', '.env');
  const original = await fs.readFile(envPath, 'utf8');
  const nextPassword = crypto.randomBytes(32).toString('base64url');
  const nextEnv = /^ADMIN_PASSWORD=.*$/m.test(original)
    ? original.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${nextPassword}`)
    : `${original}\nADMIN_PASSWORD=${nextPassword}\n`;
  // Check writability before changing the account; keep previous configuration on DB failure.
  await fs.writeFile(envPath, nextEnv, { mode: 0o600 });
  try {
    const passwordHash = await bcrypt.hash(nextPassword, 12);
    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({ where: { id: user.id }, data: { passwordHash } });
      await transaction.refreshToken.deleteMany({ where: { userId: user.id } });
      await transaction.passwordResetToken.deleteMany({ where: { userId: user.id } });
    });
  } catch (error) {
    await fs.writeFile(envPath, original, { mode: 0o600 });
    throw error;
  }
  console.log('Administrator password rotated. New credential saved only in backend/.env; refresh/reset tokens revoked. Update hosting ADMIN_PASSWORD to match.');
}
main().catch(() => { console.error('Administrator rotation could not finish; no credentials printed.'); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
