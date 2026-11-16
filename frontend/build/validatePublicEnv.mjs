const allowedKeys = new Set(['VITE_API_URL', 'VITE_API_BASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_GOOGLE_CLIENT_ID']);

// VITE_* values are public. Reject new variables until they are deliberately reviewed.
export function validatePublicEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (!allowedKeys.has(key)) throw new Error(`Unreviewed public environment variable: ${key}`);
    if (!value) continue;
    if (key === 'VITE_GOOGLE_CLIENT_ID') {
      if (!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(value)) throw new Error('Invalid public Google client ID');
    } else if (key === 'VITE_SUPABASE_ANON_KEY') {
      let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(value);
      try {
        const payload = JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString());
        publicKey = payload.role === 'anon';
      } catch (_) { /* New publishable keys do not contain JWT payloads. */ }
      if (!publicKey) throw new Error('VITE_SUPABASE_ANON_KEY must be a public anonymous/publishable key');
    } else {
      try {
        const url = new URL(value, 'http://localhost');
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch (_) { throw new Error(`Invalid public URL in ${key}`); }
    }
  }
}
