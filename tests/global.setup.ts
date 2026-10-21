import { test as setup, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const adminFile = '.auth/admin.json';
const customerFile = '.auth/customer.json';
const guestFile = '.auth/guest.json';

const authDir = path.resolve('.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

/**
 * The demo site is behind Cloudflare. GitHub-hosted runners get an interactive
 * "Verify you are human" challenge before the Angular app is served. Click the
 * Turnstile checkbox when it appears, then wait for the real login form.
 */
async function passSecurityVerification(page: Page) {
  const challengeHeading = page.getByRole('heading', { name: /Performing security verification/i });
  const emailInput = page.getByTestId('email');

  await expect(emailInput.or(challengeHeading)).toBeVisible({ timeout: 30000 });

  if (!(await challengeHeading.isVisible())) {
    return;
  }

  console.log('Cloudflare challenge detected; completing Turnstile verification');

  const challengeFrame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
  const checkbox = challengeFrame.locator('input[type="checkbox"]');

  await checkbox.waitFor({ state: 'visible', timeout: 15000 });
  await checkbox.click();

  await expect(emailInput).toBeVisible({ timeout: 30000 });
}

setup('authenticate admin', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/login`);
  await passSecurityVerification(page);

  await page.getByTestId('email').fill(process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com');
  await page.getByTestId('password').fill(process.env.ADMIN_PASSWORD || 'welcome01');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('nav-menu')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: adminFile });
});

setup('authenticate customer', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/login`);
  await passSecurityVerification(page);

  await page.getByTestId('email').fill(process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com');
  await page.getByTestId('password').fill(process.env.CUSTOMER_PASSWORD || 'welcome01');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('nav-menu')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: customerFile });

  // Keep Cloudflare's clearance cookies but drop the authenticated localStorage
  // token. This lets logged-out specs start clean without triggering a new
  // challenge on every test.
  const state = await page.context().storageState();
  fs.writeFileSync(
    guestFile,
    JSON.stringify({ cookies: state.cookies, origins: [] }, null, 2),
  );
});
