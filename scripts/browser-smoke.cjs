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
  await page.addInitScript(() => { window.cspViolations = []; addEventListener('securitypolicyviolation', (event) => window.cspViolations.push({ directive: event.violatedDirective, blocked: event.blockedURI })); });
  const capture = async (name) => {
    await page.waitForTimeout(700);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow: ${name}`);
    await page.screenshot({ path: path.join(artifacts, `${name}.png`) });
  };
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/gallery', '/login', '/signup', '/about', '/contact', '/reviews', '/privacy', '/terms', '/faq', '/forgot-password']) {
        await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'domcontentloaded' });
        await page.locator('main').waitFor({ state: 'visible' });
        if (await page.getByRole('button', { name: 'Essential only', exact: true }).isVisible()) await page.getByRole('button', { name: 'Essential only', exact: true }).click();
        await capture(`${width}-${route.slice(1) || 'home'}`);
        console.log(`Page checked: ${width}px ${route}`);
        assert.equal(await page.getByText('Something went wrong', { exact: true }).count(), 0);
        assert.deepEqual(await page.evaluate(() => window.cspViolations.filter(({ blocked }) => !/^http:\/\/(127\.0\.0\.1|localhost):5000\//.test(blocked))), [], `CSP violation on ${route}`);
      }
    }
    await page.goto('http://127.0.0.1:4173/?utm_source=browser-test&utm_campaign=flowers');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('shop-campaign-v1')), null);
    await page.getByRole('button', { name: 'Cookie preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Allow campaign tracking' }).click();
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('shop-campaign-v1')).utm_source), 'browser-test');
    await page.getByRole('button', { name: 'Cookie preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Essential only', exact: true }).click();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('shop-campaign-v1')), null);
    await page.getByRole('button', { name: 'Use dark theme' }).click();
    await page.reload();
    assert.ok(await page.locator('html').evaluate((element) => element.classList.contains('dark')));
    await capture('390-home-dark');
    await page.getByRole('button', { name: 'Use light theme' }).click();
    await page.getByRole('button', { name: 'Open mobile menu' }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.getByRole('button', { name: 'Search site' }).click();
    await page.getByLabel('Search by flower or design').fill('Security Test Bouquet');
    await page.getByRole('dialog').getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('heading', { name: 'Find flowers for your occasion' }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('q'), 'Security Test Bouquet');
    await page.goto('http://127.0.0.1:4173/faq');
    await page.locator('summary').first().click();
    assert.ok(await page.locator('details').first().evaluate((element) => element.open));
    await page.goto('http://127.0.0.1:4173/');
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Back to top' }).click();
    await page.waitForFunction(() => scrollY < 10);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('http://127.0.0.1:4173/contact');
    await page.getByRole('button', { name: 'Copy phone number' }).click();
    await page.getByText('Phone number copied.', { exact: true }).waitFor();
    await page.goto('http://127.0.0.1:4173/privacy');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('header').isVisible(), false);
    await capture('privacy-print');
    await page.emulateMedia({ media: 'screen' });
    await page.goto('http://127.0.0.1:4173/login');
    await page.locator('input[name="email"]').fill(fixtures.email);
    await page.locator('input[name="password"]').fill(fixtures.password);
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    assert.equal(await page.locator('#password').getAttribute('type'), 'text');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    const [loginResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST'),
      page.locator('main form button[type="submit"]').click(),
    ]);
    assert.equal(loginResponse.status(), 200);
    await page.waitForURL('http://127.0.0.1:4173/my-orders');
    assert.equal(await page.evaluate(() => localStorage.getItem('bb_access_token')), null);
    await page.goto(`http://127.0.0.1:4173/product/${fixtures.productId}`);
    await page.getByRole('heading', { name: 'Security Test Bouquet', exact: true }).waitFor();
    await page.getByRole('button', { name: /Add Stones/ }).click();
    await capture('390-product');
    const [added] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/users/cart') && r.request().method() === 'POST'), page.getByRole('button', { name: /Add to Cart/i }).click()]);
    assert.equal(added.status(), 201);
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
    const [response] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/orders') && r.request().method() === 'POST'), page.locator('#checkout-form button[type="submit"]').click()]);
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
    await page.goto('http://127.0.0.1:4173/admin');
    await page.waitForURL('http://127.0.0.1:4173/');
    console.log(`Browser checks passed: 22 desktop/mobile pages, consent and UTM opt-in/withdrawal, persisted theme, mobile menu, search, FAQ, back-to-top, clipboard, print, password visibility, login, cart, database-backed checkout and admin-route denial. Screenshots: ${artifacts}`);
  } catch (error) { await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }); console.error('Browser failure on:', page.url()); throw error; } finally { await browser.close(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
