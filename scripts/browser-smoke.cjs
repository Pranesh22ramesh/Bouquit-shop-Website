const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

// Run the isolated database test with --serve and Vite preview on port 4173 first.
// Only synthetic local credentials are used; no WhatsApp/email messages are sent.
async function main() {
  const fixtures = JSON.parse(await fs.readFile(path.join(os.tmpdir(), 'shop-web-security-fixtures.json'), 'utf8'));
  const artifacts = path.join(os.tmpdir(), 'shop-web-security-browser');
  await fs.mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const failures = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (error) => failures.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('offerPopupShownThisSession', 'true'));
  const capture = async (name) => {
    await page.waitForTimeout(700);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow: ${name}`);
    await page.screenshot({ path: path.join(artifacts, `${name}.png`) });
  };
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/gallery', '/login', '/signup', '/about', '/contact', '/reviews']) {
        await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'domcontentloaded' });
        await page.locator('main').waitFor({ state: 'visible' });
        await capture(`${width}-${route.slice(1) || 'home'}`);
        console.log(`Page checked: ${width}px ${route}`);
        assert.equal(await page.getByText('Something went wrong', { exact: true }).count(), 0);
      }
    }
    await page.goto('http://127.0.0.1:4173/login');
    await page.locator('input[name="email"]').fill(fixtures.email);
    await page.locator('input[name="password"]').fill(fixtures.password);
    const loginResponse = page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST');
    await page.locator('form button[type="submit"]').click();
    assert.equal((await loginResponse).status(), 200);
    await page.waitForURL('http://127.0.0.1:4173/');
    await page.goto(`http://127.0.0.1:4173/product/${fixtures.productId}`);
    await page.getByRole('heading', { name: 'Security Test Bouquet', exact: true }).waitFor();
    await page.getByRole('button', { name: /Add Stones/ }).click();
    await capture('390-product');
    const added = page.waitForResponse((r) => r.url().endsWith('/api/users/cart') && r.request().method() === 'POST');
    await page.getByRole('button', { name: /Add to Cart/i }).click();
    assert.equal((await added).status(), 201);
    await page.goto('http://127.0.0.1:4173/cart');
    await page.getByRole('button', { name: 'Proceed to Standard Checkout' }).waitFor();
    await capture('390-cart');
    await page.getByRole('button', { name: 'Proceed to Standard Checkout' }).click();
    await page.locator('#checkout-form').waitFor();
    await page.getByPlaceholder('Street Address, Area').fill('12 Flower Street');
    const inputs = page.locator('#checkout-form input[type="text"]');
    await inputs.nth(1).fill('Karur');
    await inputs.nth(2).fill('639001');
    await capture('390-checkout');
    const placed = page.waitForResponse((r) => r.url().endsWith('/api/orders') && r.request().method() === 'POST');
    await page.locator('#checkout-form button[type="submit"]').click();
    const response = await placed;
    assert.equal(response.status(), 201);
    const order = await response.json();
    assert.equal(Number(order.totalPrice), 1100);
    await page.getByRole('button', { name: /Send to WhatsApp/ }).waitFor();
    await capture('390-order-success');
    await page.getByRole('button', { name: 'View my orders', exact: true }).click();
    await page.getByText(`Order #${order._id.slice(-6).toUpperCase()}`, { exact: true }).waitFor();
    await page.getByText(`Order #${order._id.slice(-6).toUpperCase()}`, { exact: true }).scrollIntoViewIfNeeded();
    await capture('390-orders');
    assert.deepEqual(failures, []);
    console.log(`Browser checks passed: 14 desktop/mobile pages, login, product customization, cart, checkout without a date, order confirmation and persisted order history. Screenshots: ${artifacts}`);
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
