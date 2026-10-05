import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

/**
 * Global Setup — runs ONCE before the entire test suite.
 *
 * Playwright feature: globalSetup + storageState
 *
 * We authenticate as each role here and save the browser storage (cookies +
 * localStorage) to a JSON file. Tests that need an authenticated session can
 * then load that file via `use: { storageState }` — avoiding a login round-
 * trip in every single test.
 *
 * NOTE: globalSetup runs as a plain Node script, NOT via the test runner,
 * so it does NOT inherit testIdAttribute from playwright.config.ts.
 * We use CSS attribute selectors ([data-test="..."]) directly here.
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();

  const authDir = path.resolve('.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir);

  // ── Admin role ────────────────────────────────────────────────────────────
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  await adminPage.goto(`${baseURL}/auth/login`, { waitUntil: 'domcontentloaded' });
  await adminPage.locator('[data-test="email"]').fill(process.env.ADMIN_EMAIL!);
  await adminPage.locator('[data-test="password"]').fill(process.env.ADMIN_PASSWORD!);
  await adminPage.locator('[data-test="login-submit"]').click();

  try {
    await adminPage.waitForSelector('[data-test="nav-menu"]', { state: 'visible', timeout: 30000 });
  } catch (e) {
    console.error('Admin login failed. Dumping page content...');
    fs.writeFileSync('admin_login_fail.html', await adminPage.content());
    throw e;
  }

  await adminContext.storageState({ path: '.auth/admin.json' });
  await adminContext.close();

  // ── Customer role ────────────────────────────────────────────────────────
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();

  await customerPage.goto(`${baseURL}/auth/login`, { waitUntil: 'domcontentloaded' });
  await customerPage.locator('[data-test="email"]').fill(process.env.CUSTOMER_EMAIL!);
  await customerPage.locator('[data-test="password"]').fill(process.env.CUSTOMER_PASSWORD!);
  await customerPage.locator('[data-test="login-submit"]').click();

  try {
    await customerPage.waitForSelector('[data-test="nav-menu"]', { state: 'visible', timeout: 30000 });
  } catch (e) {
    console.error('Customer login failed. Dumping page content...');
    fs.writeFileSync('customer_login_fail.html', await customerPage.content());
    throw e;
  }

  await customerContext.storageState({ path: '.auth/customer.json' });
  await customerContext.close();

  await browser.close();

  console.log('✅ Global setup: auth states saved for customer and admin roles.');
}

export default globalSetup;
