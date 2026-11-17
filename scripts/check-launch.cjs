const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const state = JSON.parse(fs.readFileSync(path.join(root, 'launch-readiness.json'), 'utf8'));
(async () => {
  const missing = [];
  for (const flag of ['approved', 'legalPoliciesApproved', 'productionDatabaseVerified', 'exposedCredentialsRotated', 'resetEmailVerified']) if (state[flag] !== true) missing.push(flag);
  const domain = state.customDomain;
  if (!/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(domain) || /\.(vercel\.app|onrender\.com)$/i.test(domain)) missing.push('owned custom domain');
  if (!fs.existsSync(path.join(root, 'frontend/public/favicon.svg'))) missing.push('favicon');
  if (missing.length) { console.error(`Launch blocked: ${missing.join(', ')}. See LAUNCH_CHECKLIST.md.`); process.exitCode = 1; return; }
  try {
    await require('node:dns/promises').resolve(domain);
    const response = await fetch(`https://${domain}/`, { redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!response.ok || !/midhunyas/i.test(await response.text())) throw new Error('Site verification failed');
    console.log('Launch configuration, DNS and HTTPS site identity checks passed.');
  } catch { console.error('Launch blocked: custom domain must resolve over HTTPS to this website.'); process.exitCode = 1; }
})();
