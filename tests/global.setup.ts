import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const adminFile = '.auth/admin.json';
const customerFile = '.auth/customer.json';
const guestFile = '.auth/guest.json';

const authDir = path.resolve('.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

setup('authenticate admin', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/login`);
  await page.getByTestId('email').fill(process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com');
  await page.getByTestId('password').fill(process.env.ADMIN_PASSWORD || 'welcome01');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('nav-menu')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: adminFile });
});

setup('authenticate customer', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/login`);
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
