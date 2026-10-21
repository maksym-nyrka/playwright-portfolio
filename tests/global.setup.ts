import { test as setup, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const adminFile = '.auth/admin.json';
const customerFile = '.auth/customer.json';
const guestFile = '.auth/guest.json';

const authDir = path.resolve('.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

// Only used when setup runs against the live demo (local development, or CI
// with a local Toolshop instance disabled).
setup.setTimeout(120_000);

async function passSecurityVerification(page: Page) {
  const challengeHeading = page.getByRole('heading', { name: /Performing security verification/i });
  const emailInput = page.getByTestId('email');

  await expect(emailInput.or(challengeHeading)).toBeVisible({ timeout: 30_000 });

  if (!(await challengeHeading.isVisible())) {
    return;
  }

  console.log('Cloudflare challenge detected; attempting Turnstile verification');

  // Prefer the real checkbox when it is exposed through the frame tree.
  let checkbox = page.frames()
    .find(frame => frame.url().includes('challenges.cloudflare.com'))
    ?.locator('input[type="checkbox"], [role="checkbox"]')
    .first();

  if (checkbox && await checkbox.isVisible().catch(() => false)) {
    await checkbox.click();
  } else {
    // The widget is rendered inside a cross-origin/closed-shadow frame, so its
    // checkbox is not always visible to DOM locators. The managed challenge
    // layout is stable at 1280x720; click the checkbox by its screen position.
    await page.waitForTimeout(2_000);
    const widget = await page.locator('iframe').evaluateAll(frames =>
      frames
        .map(frame => {
          const rect = frame.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })
        .find(rect => rect.width > 200 && rect.height > 50 && rect.y > 100),
    );

    if (widget) {
      await page.mouse.click(widget.x + 19, widget.y + 32);
    } else {
      await page.mouse.click(211, 338);
    }
  }

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

  // Logged-out specs need a clean auth state but should still inherit any
  // cookies set by the app (for example Cloudflare clearance when running
  // against the live demo locally).
  const state = await page.context().storageState();
  fs.writeFileSync(
    guestFile,
    JSON.stringify({ cookies: state.cookies, origins: [] }, null, 2),
  );
});
