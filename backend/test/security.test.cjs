const { test, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');

// Never load deployment credentials or connect to the configured database in this suite.
Object.assign(process.env, {
  NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused@127.0.0.1:1/unused',
  SUPABASE_STORAGE_ENABLED: 'false', TRUST_PROXY_HOPS: '1',
  JWT_ACCESS_SECRET: crypto.randomBytes(48).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(48).toString('hex'),
  JWT_RESET_SECRET: crypto.randomBytes(48).toString('hex'),
  RATE_LIMIT_GLOBAL_MAX: '1000', RATE_LIMIT_PUBLIC_MAX: '2', RATE_LIMIT_USER_MAX: '100',
  RATE_LIMIT_AUTH_IP_ATTEMPT_MAX: '4', RATE_LIMIT_AUTH_ACCOUNT_ATTEMPT_MAX: '3',
  RATE_LIMIT_SIGNUP_ACCOUNT_ATTEMPT_MAX: '2', RATE_LIMIT_AUTH_BACKOFF_BASE_MS: '10000',
  RATE_LIMIT_AUTH_BACKOFF_MAX_MS: '60000', UPLOAD_MAX_FILE_BYTES: '2048', UPLOAD_MAX_IMAGE_PIXELS: '10000',
});
const users = new Map();
const fakePrisma = { user: { findUnique: async ({ where }) => users.get(where.id) || null } };
require.cache[require.resolve('../src/config/prisma')] = { exports: { prisma: fakePrisma } };
const { app } = require('../src/app');
const { ApiError } = require('../src/utils/apiError');
const { env } = require('../src/config/env');
const tokens = require('../src/utils/token');
const authService = require('../src/services/authService');
const userService = require('../src/services/userService');
const orderService = require('../src/services/orderService');
const reviewService = require('../src/services/reviewService');
const productService = require('../src/services/productService');
const contentService = require('../src/services/contentService');
const { createBackoffStore } = require('../src/middleware/rateLimiter');
const { validateContentPayload } = require('../src/middleware/contentSchema');
const { uploadImage, deleteImage, extractStoragePath } = require('../src/services/storageService');
const sharp = require('sharp');
const password = crypto.randomBytes(18).toString('hex');
let server, base, ipNumber = 0;
const newIp = () => `198.18.${Math.floor(++ipNumber / 250)}.${ipNumber % 250 + 1}`;
const actor = (role = 'USER') => {
  const user = { id: crypto.randomUUID(), email: `${crypto.randomUUID()}@example.com`, role, authVersion: 0, isActive: true, fullName: 'Test User' };
  users.set(user.id, user);
  return { user, token: tokens.signAccessToken(user) };
};
async function request(url, { method = 'GET', json, raw, form, token, ip = newIp(), headers = {} } = {}) {
  const response = await fetch(`${base}${url}`, {
    method, headers: { 'X-Requested-With': 'shop-web', 'X-Forwarded-For': ip, ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(json !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: form || raw || (json === undefined ? undefined : JSON.stringify(json)), signal: AbortSignal.timeout(5000),
  });
  const text = await response.text();
  return { status: response.status, headers: response.headers, text, body: (() => { try { return JSON.parse(text); } catch { return null; } })() };
}
before(async () => { server = app.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });

test('cookie session endpoints require a CSRF header and exact trusted origins', async () => {
  const missing = await request('/api/auth/logout', { method: 'POST', headers: { 'X-Requested-With': '' } });
  assert.equal(missing.status, 403);
  const foreign = await request('/api/auth/logout', { method: 'POST', headers: { Origin: 'https://attacker.example' } });
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
  const allowed = await request('/api/health', { headers: { Origin: 'http://localhost:4173' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:4173');
  assert.match(allowed.headers.get('content-security-policy'), /default-src 'none'/);
  assert.equal(allowed.headers.get('x-powered-by'), null);
  assert.equal(allowed.headers.get('x-content-type-options'), 'nosniff');
  for (const filename of ['/.env', '/.git/config', '/package.json']) assert.equal((await request(filename)).status, 404);
});

test('sub-admin cannot manage accounts and incrementing authVersion revokes access immediately', async () => {
  const subadmin = actor('SUBADMIN');
  assert.equal((await request('/api/users', { token: subadmin.token })).status, 403);
  assert.equal((await request(`/api/users/${crypto.randomUUID()}/password`, { method: 'PUT', token: subadmin.token, json: { password } })).status, 403);
  subadmin.user.authVersion += 1;
  assert.equal((await request('/api/users/cart', { token: subadmin.token })).status, 401);
});

test('concurrent login aliases and normalized email variants share one account budget across IPs', async () => {
  const spy = mock.method(authService, 'login', async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
    throw new ApiError(401, 'Invalid email or password');
  });
  const email = `security${crypto.randomBytes(5).toString('hex')}@gmail.com`;
  try {
    const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => request(
      ['/api/auth/login', '/api/auth/admin/login', '/API/AUTH/LOGIN/'][i % 3],
      { method: 'POST', json: { email: i % 2 ? email.toUpperCase() : email.replace('@', '+tag@'), password } }
    )));
    assert.equal(responses.filter((r) => r.status === 401).length, 3);
    assert.equal(responses.filter((r) => r.status === 429).length, 5);
    assert.equal(spy.mock.callCount(), 3);
    assert.ok(responses.filter((r) => r.status === 429).every((r) => Number(r.headers.get('retry-after')) > 0));
  } finally { spy.mock.restore(); }
});

test('IP budget spans auth endpoints, invalid input, and successful logins', async () => {
  const ip = newIp();
  const user = actor();
  const spy = mock.method(authService, 'login', async () => ({ token: user.token, refreshToken: tokens.signRefreshToken(user.user), user: user.user }));
  try {
    assert.equal((await request('/api/auth/login', { method: 'POST', ip, json: { email: user.user.email, password } })).status, 200);
    for (const endpoint of ['signup', 'forgotpassword', 'login']) {
      assert.equal((await request(`/api/auth/${endpoint}`, { method: 'POST', ip, json: { email: [] } })).status, 400);
    }
    const limited = await request('/api/auth/forgotpassword', { method: 'POST', ip, json: { email: 'new@example.com' } });
    assert.equal(limited.status, 429);
    assert.equal(spy.mock.callCount(), 1);
  } finally { spy.mock.restore(); }
});

test('IPv6 subnet rotation cannot bypass authentication throttling', async () => {
  for (let i = 1; i <= 4; i++) {
    assert.equal((await request('/api/auth/login', { method: 'POST', ip: `2001:db8:abcd:1200::${i}`, json: {} })).status, 400);
  }
  assert.equal((await request('/api/auth/login', { method: 'POST', ip: '2001:db8:abcd:12ff::99', json: {} })).status, 429);
});

test('backoff increases, is capped, permits retries, and expires without evicting active accounts', () => {
  let now = 0;
  const store = createBackoffStore({ now: () => now, windowMs: 1000, baseMs: 10, maxMs: 40, maxEntries: 1 });
  assert.equal(store.admit('account', 2).allowed, true);
  assert.equal(store.admit('account', 2).allowed, true);
  assert.equal(store.admit('account', 2).retryMs, 10);
  assert.equal(store.admit('other', 2).capacity, true);
  now = 5;
  assert.equal(store.admit('account', 2).retryMs, 5); // Denials do not extend the delay.
  now = 10;
  assert.equal(store.admit('account', 2).allowed, true);
  assert.equal(store.admit('account', 2).retryMs, 20);
  now = 30;
  assert.equal(store.admit('account', 2).allowed, true);
  assert.equal(store.admit('account', 2).retryMs, 40);
  now = 70;
  store.admit('account', 2);
  assert.equal(store.admit('account', 2).retryMs, 40);
  now = 1071;
  assert.equal(store.admit('other', 2).allowed, true);
});

test('public browsing has a lower budget than authenticated user actions', async () => {
  const ip = newIp();
  for (let i = 0; i < 2; i++) assert.equal((await request('/api/health', { ip })).status, 200);
  assert.equal((await request('/api/health', { ip })).status, 429);
  const { token } = actor();
  const spy = mock.method(userService, 'getCart', async () => []);
  try {
    for (let i = 0; i < 4; i++) assert.equal((await request('/api/users/cart', { token, ip })).status, 200);
  } finally { spy.mock.restore(); }
});

test('strict JSON types, unknown keys, query arrays and nested payloads are rejected before service calls', async () => {
  const { token } = actor('ADMIN');
  const order = { shippingAddress: { address: '12 Flower Street', city: 'Karur', postalCode: '639001', country: 'India' }, paymentMethod: 'Cash on Delivery' };
  const spy = mock.method(orderService, 'createOrder', async (_, payload) => ({ id: crypto.randomUUID(), paymentMethod: payload.paymentMethod }));
  try {
    assert.equal((await request('/api/orders', { method: 'POST', token, json: order })).status, 201);
    for (const json of [
      { ...order, paymentMethod: ['Cash on Delivery'] }, { ...order, deliveryDate: false },
      { ...order, deliveryDate: '2027-02-30' }, { ...order, totalPrice: 1 },
      { ...order, shippingAddress: { ...order.shippingAddress, secret: 'value' } },
    ]) assert.equal((await request('/api/orders', { method: 'POST', token, json })).status, 400);
    assert.equal(spy.mock.callCount(), 1);
    for (const value of ['false', 0, [], null]) {
      assert.equal((await request(`/api/users/${crypto.randomUUID()}/status`, { method: 'PATCH', token, json: { isActive: value } })).status, 400);
    }
    for (const value of [false, 0, null, []]) {
      assert.equal((await request('/api/users/profile', { method: 'PUT', token, json: { phoneNumber: value } })).status, 400);
    }
    assert.equal((await request('/api/products?limit=1&limit=2')).status, 400);
    assert.equal((await request('/api/products?limit=100000')).status, 400);
    assert.equal((await request('/api/users/cart', { method: 'POST', token, json: { productId: crypto.randomUUID(), quantity: 1, customization: { mainColor: 'red', extraPrice: 0 } } })).status, 400);
    assert.equal((await request('/api/users/profile', { method: 'PUT', token, json: { password: 'ðŸŒ¸'.repeat(20) } })).status, 400);
    assert.equal((await request('/api/auth/login', { method: 'POST', raw: '{"__proto__":{"admin":true}}' })).status, 400);
    assert.equal((await request('/api/auth/login', { method: 'POST', raw: '{"email":' + '['.repeat(100) + '0' + ']'.repeat(100) + '}' })).status, 400);
  } finally { spy.mock.restore(); }
});

test('valid JSON and multipart reviews both work; coerced ratings and string flags fail', async () => {
  const { token } = actor('ADMIN');
  const create = mock.method(reviewService, 'createReview', async (_, value) => ({ rating: Number(value.rating) }));
  const update = mock.method(reviewService, 'updateReview', async (_, id, value) => ({ id, ...value }));
  try {
    const json = { rating: 5, comment: 'Lovely flowers', productId: crypto.randomUUID() };
    assert.equal((await request('/api/reviews', { method: 'POST', token, json })).status, 201);
    const form = new FormData(); for (const [key, value] of Object.entries(json)) form.append(key, value);
    assert.equal((await request('/api/reviews', { method: 'POST', token, form })).status, 201);
    for (const rating of ['5', [5], true]) assert.equal((await request('/api/reviews', { method: 'POST', token, json: { ...json, rating } })).status, 400);
    const url = `/api/reviews/${crypto.randomUUID()}`;
    assert.equal((await request(url, { method: 'PUT', token, json: { rating: 4, comment: 'Updated flowers', isHidden: false } })).status, 200);
    assert.equal((await request(url, { method: 'PUT', token, json: { rating: 4, comment: 'Updated flowers', isHidden: 'false' } })).status, 400);
    assert.equal(create.mock.callCount(), 2);
    assert.equal(update.mock.callCount(), 1);
  } finally { create.mock.restore(); update.mock.restore(); }
});

test('valid long reset JWTs work and different tokens for one verified account share the reset budget', async () => {
  const { user, token } = actor();
  user.email = `${'a'.repeat(60)}@example.com`;
  const spy = mock.method(authService, 'resetPassword', async () => ({ token, refreshToken: tokens.signRefreshToken(user), user }));
  try {
    const resetTokens = Array.from({ length: 4 }, () => tokens.signResetToken(user));
    assert.ok(resetTokens[0].length > 256);
    assert.equal(new Set(resetTokens).size, 4);
    for (let i = 0; i < 4; i++) {
      assert.equal((await request(`/api/auth/resetpassword/${resetTokens[i]}`, { method: 'PUT', json: { password, confirmPassword: password } })).status, i < 3 ? 200 : 429);
    }
    assert.equal(spy.mock.callCount(), 3);
    assert.equal((await request('/api/auth/refresh', { method: 'POST', headers: { Cookie: `${env.refreshCookieName}=${encodeURIComponent('j:{"x":1}')}` } })).status, 400);
    assert.throws(() => tokens.verifyResetToken(tokens.signRefreshToken(user)));
  } finally { spy.mock.restore(); }
});

test('API errors do not expose database paths, stack traces, or internal 500 messages, and are logged', async () => {
  const { token } = actor();
  const diagnostic = 'Database connection failed at /private/database/client.js:42';
  const logs = mock.method(console, 'error', () => {});
  const db = mock.method(fakePrisma.user, 'findUnique', async () => { throw new Error(diagnostic); });
  try {
    const response = await request('/api/users/cart', { token });
    assert.equal(response.status, 500);
    assert.equal(response.text.includes('database/client'), false);
    assert.equal(response.text.includes('stack'), false);
    assert.ok(response.body.errorId);
    assert.ok(logs.mock.calls.some((call) => call.arguments.some((arg) => String(arg).includes(diagnostic))));
  } finally { db.mock.restore(); }
  const service = mock.method(productService, 'listProducts', async () => { throw new ApiError(500, diagnostic); });
  try {
    const response = await request('/api/products');
    assert.equal(response.status, 500);
    assert.equal(response.text.includes(diagnostic), false);
    assert.equal(response.headers.get('cache-control'), null);
  } finally { service.mock.restore(); logs.mock.restore(); }
});

test('content schema rejects unsafe URLs, unknown nested fields, duplicate and invalid indexed uploads', () => {
  for (const buttonLink of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'https://user:pass@example.com', 'https://']) {
    assert.throws(() => validateContentPayload('home-highlight', { primaryButtonLink: buttonLink }));
  }
  assert.throws(() => validateContentPayload('home-highlight', { offerPopup: { enabled: 'false' } }));
  assert.throws(() => validateContentPayload('home-highlight', { offerPopup: { unknown: 'value' } }));
  assert.throws(() => validateContentPayload('home-highlight', {}, [{ fieldname: 'homeCategoryImage_90' }]));
  assert.throws(() => validateContentPayload('about', {}, [{ fieldname: 'heroImageFile' }, { fieldname: 'heroImageFile' }]));
  assert.doesNotThrow(() => validateContentPayload('home-highlight', {
    heroHeadline1: 'Fresh flowers', collections: [{ id: 'bouquets', title: 'Bouquets', startingPrice: 'From INR 650', image: '/gallery/flowers.jpg', link: '/gallery' }],
    offerPopup: { enabled: false, buttonLink: 'https://wa.me/919000000000?text=Hello%20flowers' },
  }));
});

test('real uploads reject spoofed MIME/extensions, bad bytes, excessive size and pixel dimensions', async () => {
  const { token } = actor();
  const valid = await sharp({ create: { width: 10, height: 10, channels: 3, background: 'red' } }).png().toBuffer();
  const huge = await sharp({ create: { width: 101, height: 100, channels: 3, background: 'red' } }).png().toBuffer();
  const spy = mock.method(reviewService, 'createReview', async (_, value) => ({ rating: Number(value.rating) }));
  const upload = (buffer, name, type) => {
    const form = new FormData(); form.append('rating', '5'); form.append('comment', 'Fresh flowers');
    form.append('image', new Blob([buffer], { type }), name);
    return request('/api/reviews', { method: 'POST', token, form });
  };
  try {
    assert.equal((await upload(valid, 'flowers.png', 'image/png')).status, 201);
    for (const args of [[valid, 'flowers.jpg', 'image/png'], [valid, 'flowers.png', 'image/jpeg'],
      [Buffer.from('<script>alert(1)</script>'), 'flowers.png', 'image/png'],
      [valid.subarray(0, 20), 'flowers.png', 'image/png'], [Buffer.alloc(3000), 'flowers.png', 'image/png'],
      [huge, 'flowers.png', 'image/png'], [valid, 'flowers.svg', 'image/svg+xml']]) {
      assert.equal((await upload(...args)).status, 400);
    }
    assert.equal(spy.mock.callCount(), 1);
  } finally { spy.mock.restore(); }
});

test('stored uploads contain only re-encoded image bytes, have unique paths, and cannot be deleted using foreign URLs', async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: 'blue' } }).png().toBuffer();
  const marker = Buffer.from('<script>untrusted-upload-marker</script>');
  const file = { buffer: Buffer.concat([png, marker]) };
  const saved = [];
  try {
    saved.push(...await Promise.all([1, 2].map(() => uploadImage({ file, folder: 'security-tests', filenameBase: '../../flowers.php' }))));
    assert.notEqual(saved[0].path, saved[1].path);
    for (const image of saved) {
      const bytes = await fs.readFile(path.join(__dirname, '..', env.uploadDir, image.path));
      assert.equal((await sharp(bytes).metadata()).format, 'webp');
      assert.equal(bytes.includes(marker), false);
      const response = await fetch(`${base}${image.url}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/webp');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.ok(response.headers.get('content-security-policy').includes('sandbox'));
      await response.arrayBuffer();
      assert.equal(extractStoragePath(`https://evil.example${image.url}`), null);
      await deleteImage(`https://evil.example${image.url}`);
      await fs.access(path.join(__dirname, '..', env.uploadDir, image.path));
    }
    assert.equal((await request(`/${env.uploadDir}/security-tests/shell.html`)).status, 404);
    assert.equal((await request(`/${env.uploadDir}/security-tests/file.php`)).status, 404);
    await assert.rejects(uploadImage({ file: { buffer: png.subarray(0, 40) }, folder: 'security-tests', filenameBase: 'broken' }));
    await assert.rejects(uploadImage({ file, folder: '../outside', filenameBase: 'escape' }));
  } finally {
    await Promise.all(saved.map((image) => deleteImage(image.path)));
    await fs.rmdir(path.join(__dirname, '..', env.uploadDir, 'security-tests')).catch((error) => { if (!['ENOENT', 'ENOTEMPTY'].includes(error.code)) throw error; });
  }
});

test('frontend build rejects private keys and credential-bearing URLs without printing their values', async () => {
  const { validatePublicEnv } = await import('../../frontend/build/validatePublicEnv.mjs');
  const privateValue = crypto.randomBytes(32).toString('hex');
  assert.throws(() => validatePublicEnv({ VITE_ADMIN_PASSWORD: privateValue }), (error) => !error.message.includes(privateValue));
  assert.throws(() => validatePublicEnv({ VITE_SUPABASE_ANON_KEY: privateValue }));
  assert.throws(() => validatePublicEnv({ VITE_API_URL: `https://user:${privateValue}@example.com` }));
  assert.doesNotThrow(() => validatePublicEnv({ VITE_API_BASE_URL: '/api', VITE_SUPABASE_ANON_KEY: '' }));
});
