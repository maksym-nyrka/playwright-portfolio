import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const adminFile = '.auth/admin.json';
const customerFile = '.auth/customer.json';

setup('authenticate admin', async ({ page, baseURL }) => {
  const authDir = path.resolve('.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  await page.goto(`${baseURL}/auth/login`);
  await page.getByTestId('email').fill(process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com');
  await page.getByTestId('password').fill(process.env.ADMIN_PASSWORD || 'welcome01');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('nav-menu')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: adminFile });
});

setup('authenticate customer', async ({ page, baseURL }) => {
  const authDir = path.resolve('.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  await page.goto(`${baseURL}/auth/login`);
  await page.getByTestId('email').fill(process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com');
  await page.getByTestId('password').fill(process.env.CUSTOMER_PASSWORD || 'welcome01');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('nav-menu')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: customerFile });
});
