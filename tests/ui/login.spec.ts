import { test, expect } from '../../fixtures/pages.fixture';

/**
 * AUTH — Login Tests
 *
 * Playwright features demonstrated:
 *  - Custom fixtures (loginPage, navBar injected automatically)
 *  - Page Object Model (LoginPage, NavBarComponent)
 *  - test.describe for grouping
 *  - test.use({ storageState }) for pre-authenticated sessions
 *  - Soft assertions
 *  - Parameterised tests with test.each
 */

const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';

test.describe('Login — unauthenticated flows', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // ensure clean state

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid email or password');
  });

  test('should show validation state for empty fields', async ({ loginPage }) => {
    await loginPage.goto();
    // Click submit without filling anything
    await loginPage.loginButton.click();

    // Angular sets aria-invalid="true" on invalid fields (HTML5 constraint validation)
    // Soft assertions — test keeps running even if one fails
    await expect.soft(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect.soft(loginPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  /**
   * Parameterised tests with test.each — avoids repeating similar test blocks.
   * Playwright feature: test.each (table-driven tests)
   */
  const invalidCredentials = [
    { email: '',                         password: 'welcome01',  label: 'empty email' },
    { email: 'customer@test.com',        password: '',           label: 'empty password' },
    { email: 'notanemail',               password: 'welcome01',  label: 'malformed email' },
  ];

  for (const { email, password, label } of invalidCredentials) {
    test(`should block login with ${label}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(email, password);
      await expect(loginPage.errorMessage.or(loginPage.emailInput)).toBeVisible();
    });
  }

  test('successful login redirects away from /auth/login', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(
      process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
      process.env.CUSTOMER_PASSWORD ?? 'welcome01',
    );
    await expect(loginPage.page).not.toHaveURL(/\/auth\/login/);
  });
});

test.describe('Login — pre-authenticated customer session', () => {
  /**
   * Playwright feature: storageState — load pre-saved auth cookies/localStorage
   * so this entire describe block starts already logged in, without re-doing the login flow.
   */
  test.use({ storageState: '.auth/customer.json' });

  test('customer should see account menu after session restore', async ({ page, navBar }) => {
    await page.goto(BASE_URL);
    await expect(navBar.accountMenu).toBeVisible();
  });

  test('customer should be able to log out', async ({ page, navBar }) => {
    await page.goto(BASE_URL);
    await navBar.logout();
    // Site redirects to homepage after sign-out
    await expect(page).toHaveURL(BASE_URL + '/');
  });
});
