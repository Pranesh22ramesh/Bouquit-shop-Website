const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('Set TEST_DATABASE_URL to an isolated local database with the Prisma schema applied');
const target = new URL(databaseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || !/^\/security_test(?:_[a-z0-9]+)?$/.test(target.pathname)) {
  throw new Error('Refusing to test against a non-local or non-test database');
}
Object.assign(process.env, {
  DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, NODE_ENV: 'test', SUPABASE_STORAGE_ENABLED: 'false',
  JWT_ACCESS_SECRET: crypto.randomBytes(48).toString('hex'), JWT_REFRESH_SECRET: crypto.randomBytes(48).toString('hex'),
  JWT_RESET_SECRET: crypto.randomBytes(48).toString('hex'), TRUST_PROXY_HOPS: '0', FRONTEND_URL: 'http://localhost:4173',
  RATE_LIMIT_AUTH_IP_ATTEMPT_MAX: '100', RATE_LIMIT_AUTH_ACCOUNT_ATTEMPT_MAX: '100', RATE_LIMIT_SIGNUP_ACCOUNT_ATTEMPT_MAX: '100',
  RATE_LIMIT_PUBLIC_MAX: '1000', RATE_LIMIT_USER_MAX: '1000',
});
const { app } = require('../src/app');
const { prisma } = require('../src/config/prisma');
const { env } = require('../src/config/env');
const { deleteImage } = require('../src/services/storageService');
let server;
let base;
const uploaded = [];
const fixtures = { email: `checkout-${crypto.randomUUID()}@example.com`, password: crypto.randomBytes(18).toString('hex') };
async function request(route, { method = 'GET', json, form, token, cookie } = {}) {
  const response = await fetch(`${base}/api${route}`, { method, headers: {
    ...(json ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(cookie ? { Cookie: cookie } : {}),
  }, body: form || (json ? JSON.stringify(json) : undefined), signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
async function main() {
  await prisma.$connect();
  server = app.listen(process.argv.includes('--serve') ? 5000 : 0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
  const product = await prisma.product.create({ data: { name: 'Security Test Bouquet', category: 'Bouquets', price: 1000, offerPrice: 900, badge: 'OFFER', image: '/gallery/bouquet/bouquet1.jpg', description: 'Fresh flowers for checkout verification.', featured: true } });
  fixtures.productId = product.id;
  const signup = await request('/auth/signup', { method: 'POST', json: { fullName: 'Checkout Tester', email: fixtures.email, phoneNumber: '9000000000', password: fixtures.password, confirmPassword: fixtures.password } });
  assert.equal(signup.status, 201);
  const userId = signup.data.user._id;
  const login = await request('/auth/login', { method: 'POST', json: { email: fixtures.email, password: fixtures.password } });
  assert.equal(login.status, 200);
  const token = login.data.token;
  assert.equal((await request('/users/profile', { method: 'PUT', token, json: { address: '12 Flower Street' } })).status, 200);
  assert.equal((await request('/users/cart', { method: 'POST', token, json: { productId: product.id, quantity: 2, customization: { stones: true, beads: true, mainColor: '#ff0000', secondaryColor: '#ffffff', notes: 'Test order only' } } })).status, 201);
  const orderBody = { shippingAddress: { address: '12 Flower Street', city: 'Karur', postalCode: '639001', country: 'India' }, paymentMethod: 'Cash on Delivery' };
  assert.equal((await request('/orders', { method: 'POST', token, json: { ...orderBody, totalPrice: 1 } })).status, 400);
  const order = await request('/orders', { method: 'POST', token, json: orderBody });
  assert.equal(order.status, 201);
  const stored = await prisma.order.findUnique({ where: { id: order.data._id } });
  assert.equal(Number(stored.totalPrice), (900 + 200 + 120) * 2);
  assert.equal(stored.deliveryDate, null);
  assert.equal(await prisma.cartItem.count({ where: { userId } }), 0);
  assert.equal((await request('/orders', { method: 'POST', token, json: orderBody })).status, 400);
  assert.equal(await prisma.order.count({ where: { userId } }), 1);
  const attacker = await request('/auth/signup', { method: 'POST', json: { fullName: 'Other Tester', email: `other-${crypto.randomUUID()}@example.com`, phoneNumber: '9000000001', password: fixtures.password, confirmPassword: fixtures.password } });
  assert.equal((await request(`/orders/${order.data._id}`, { token: attacker.data.token })).status, 403);
  const sharp = require('sharp');
  const bytes = await sharp({ create: { width: 16, height: 16, channels: 3, background: 'red' } }).png().toBuffer();
  const form = new FormData(); form.append('rating', '5'); form.append('comment', 'Beautiful fresh flowers'); form.append('productId', product.id);
  form.append('image', new Blob([bytes], { type: 'image/png' }), 'flowers.png');
  const review = await request('/reviews', { method: 'POST', token, form });
  assert.equal(review.status, 201); uploaded.push(review.data.image);
  assert.equal((await prisma.review.findUnique({ where: { id: review.data._id } })).rating, 5);
  const reset = await request('/auth/forgotpassword', { method: 'POST', json: { email: fixtures.email } });
  assert.equal(reset.status, 200);
  const resetToken = reset.data.resetUrl.split('/').pop();
  fixtures.password = crypto.randomBytes(18).toString('hex');
  assert.equal((await request(`/auth/resetpassword/${resetToken}`, { method: 'PUT', json: { password: fixtures.password, confirmPassword: fixtures.password } })).status, 200);
  assert.equal((await request('/auth/refresh', { method: 'POST', cookie: login.cookie })).status, 401);
  assert.equal((await request(`/auth/resetpassword/${resetToken}`, { method: 'PUT', json: { password: fixtures.password } })).status, 400);
  assert.equal((await request('/auth/login', { method: 'POST', json: { email: fixtures.email, password: fixtures.password } })).status, 200);
  console.log('PostgreSQL checks passed: signup, login, profile, customized cart, checkout totals, empty-cart replay, order ownership, image review, reset and refresh revocation.');
  if (process.argv.includes('--serve')) {
    const filename = path.join(os.tmpdir(), 'shop-web-security-fixtures.json');
    await fs.writeFile(filename, JSON.stringify({ ...fixtures, base }), { mode: 0o600 });
    console.log('Isolated QA server ready on 127.0.0.1:5000. Test fixtures are stored outside Git.');
  }
}
async function close() {
  if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
  for (const image of uploaded) await deleteImage(image);
  await prisma.$disconnect();
}
main().then(() => { if (!process.argv.includes('--serve')) return close(); })
  .catch(async (error) => { console.error(error.stack); process.exitCode = 1; await close(); });
process.on('SIGINT', () => close().then(() => process.exit()));
process.on('SIGTERM', () => close().then(() => process.exit()));
