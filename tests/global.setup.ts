import { test as setup, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const adminFile = '.auth/admin.json';
const customerFile = '.auth/customer.json';
const guestFile = '.auth/guest.json';

const authDir = path.resolve('.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

// Cloudflare can take a while to render and verify the Turnstile widget on
// GitHub-hosted runners. Give the setup steps enough time to complete it.
setup.setTimeout(120_000);

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

  // The iframe's src is sometimes assigned after the frame is created, so
  // frameLocator cannot always find it. Locate the challenge frame by URL.
  let challengeFrame = page.frames().find(frame => frame.url().includes('challenges.cloudflare.com'));
  for (let attempt = 0; !challengeFrame && attempt < 30; attempt++) {
    await page.waitForTimeout(1_000);
    challengeFrame = page.frames().find(frame => frame.url().includes('challenges.cloudflare.com'));
  }

  if (!challengeFrame) {
    throw new Error('Cloudflare challenge frame did not load');
  }

  const checkbox = challengeFrame.locator('input[type="checkbox"], [role="checkbox"]').first();
  await checkbox.waitFor({ state: 'visible', timeout: 45_000 });
  await checkbox.click();

  await expect(emailInput).toBeVisible({ timeout: 45_000 });
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
