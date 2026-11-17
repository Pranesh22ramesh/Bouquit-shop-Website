// Reports locations/categories only. Never print matching credentials or source lines.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', windowsHide: true });
const isTemplate = (value) => /^(?:<.*>|\$\{.*\}|(?:your|replace|generate|example|placeholder|change-me)[\w <>:/?.=&-]*)$/i.test(value);
const sensitiveName = /(?:PASSWORD|SECRET|SERVICE_ROLE|PRIVATE_KEY|API_KEY|ACCESS_TOKEN|REFRESH_TOKEN|DATABASE_URL|DIRECT_URL)/i;
const configured = new Set();
for (const directory of ['', 'backend', 'frontend']) {
  const folder = path.join(root, directory);
  for (const name of fs.readdirSync(folder).filter((name) => /^\.env(?:\.|$)/.test(name) && name !== '.env.example')) {
    for (const line of fs.readFileSync(path.join(folder, name), 'utf8').split(/\r?\n/)) {
      const match = /^\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (!match || !sensitiveName.test(match[1])) continue;
      const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
      if (value.length >= 8 && !isTemplate(value)) configured.add(value);
      if (/DATABASE_URL|DIRECT_URL/.test(match[1])) {
        try { const credential = decodeURIComponent(new URL(value).password); if (credential.length >= 8) configured.add(credential); } catch (_) { /* Not a URL. */ }
      }
    }
  }
}
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['provider-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,}|AKIA[A-Z0-9]{16}|sk_(?:live|test)_[A-Za-z0-9]{20,}|sb_secret_[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g],
  ['literal-credential', /\b(?:password|api[_-]?key|access[_-]?token|refresh[_-]?token|[A-Z_]*(?:SECRET|PASSWORD|SERVICE_ROLE_KEY))\s*[:=]\s*["'`]([^"'`\r\n]{8,})["'`]/gi],
  ['environment-credential', /^(?:[A-Z_]*(?:PASSWORD|SECRET|SERVICE_ROLE_KEY))=([^\r\n]{8,})$/gm],
  ['database-credential', /\bpostgres(?:ql)?:\/\/[^\s:/]+:([^\s@]+)@[^\s"'`]+/g],
  ['jwt', /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{20,}/g],
];
const findings = new Set();
let scanned = 0;
const scan = (bytes, label) => {
  if (bytes.subarray(0, 8192).includes(0)) return;
  scanned++;
  const text = bytes.toString('utf8');
  const report = (kind) => findings.add(`${label}: ${kind}`);
  for (const value of configured) if (text.includes(value)) report('configured-secret');
  for (const [kind, pattern] of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (isTemplate(match[1] || match[0])) continue;
      if (kind === 'database-credential' && label.includes('.env.example') && match[1] === 'password') continue;
      if (kind === 'literal-credential' && ['access_token', 'refresh_token', 'authorization', 'access-token', 'refresh-token'].includes(match[1])) continue;
      if (kind === 'jwt') {
        try { if (JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url')).role === 'anon') continue; } catch (_) { /* Flag malformed token too. */ }
      }
      report(kind);
    }
  }
};
const walk = (folder, output) => {
  if (!fs.existsSync(folder)) return;
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(filename, output);
    else if (entry.isFile()) output.add(path.relative(root, filename).replaceAll('\\', '/'));
  }
};
async function main() {
  const files = new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean));
  walk(path.join(root, 'frontend', 'dist'), files);
  for (const filename of files) {
    if (/(?:^|\/)\.env(?:\.|$)/.test(filename) && !filename.endsWith('.env.example')) findings.add(`${filename}: tracked-env-file`);
    const absolute = path.join(root, filename);
    if (fs.existsSync(absolute) && fs.lstatSync(absolute).isFile()) scan(fs.readFileSync(absolute), filename);
  }
  // Scan staged blobs, even when an unstaged edit has removed the credential.
  const objects = new Map();
  for (const entry of git('ls-files', '--stage', '-z').split('\0').filter(Boolean)) {
    const match = /^\d+ ([0-9a-f]+) \d\t(.+)$/s.exec(entry);
    if (match) objects.set(match[1], `index:${match[2]}`);
  }
  if (process.argv.includes('--history')) {
    for (const line of git('rev-list', '--objects', '--branches', '--remotes', '--tags').split('\n')) {
      const match = /^([0-9a-f]+) (.+)$/.exec(line);
      if (match && !objects.has(match[1])) objects.set(match[1], `history:${match[2]}@${match[1].slice(0, 8)}`);
    }
  }
  const batch = spawn('git', ['cat-file', '--batch'], { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'inherit'] });
  let pending = Buffer.alloc(0);
  let current = null;
  const parsing = (async () => {
    for await (const chunk of batch.stdout) {
      pending = Buffer.concat([pending, chunk]);
      while (true) {
        if (!current) {
          const end = pending.indexOf(10);
          if (end < 0) break;
          const [id, type, size] = pending.subarray(0, end).toString().split(' ');
          pending = pending.subarray(end + 1);
          if (type === 'missing') throw new Error('Git object unavailable');
          current = { id, type, size: Number(size) };
        }
        if (pending.length < current.size + 1) break;
        if (current.type === 'blob') scan(pending.subarray(0, current.size), objects.get(current.id));
        pending = pending.subarray(current.size + 1);
        current = null;
      }
    }
  })();
  batch.stdin.end([...objects.keys()].join('\n') + '\n');
  const completion = new Promise((resolve, reject) => { batch.on('error', reject); batch.on('close', (code) => code === 0 ? resolve() : reject(new Error('Git scan failed'))); });
  await Promise.all([parsing, completion]);
  for (const finding of findings) console.error(finding);
  console.log(`Secret scan: ${scanned} text files/blobs checked; ${findings.size} findings. Values are never printed.`);
  if (findings.size) process.exitCode = 1;
}
main().catch(() => { console.error('Secret scan could not finish.'); process.exitCode = 1; });
