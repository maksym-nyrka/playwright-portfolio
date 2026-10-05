import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { NavBarComponent } from '../pages/NavBarComponent';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ContactPage } from '../pages/ContactPage';

/**
 * Custom fixture type — extends the base Playwright fixtures with our Page Objects.
 *
 * Playwright feature: custom test fixtures
 *
 * By declaring these here, every test that uses this `test` object automatically
 * receives fully-initialised page objects — no boilerplate `new LoginPage(page)`
 * inside every test.
 */
type PageFixtures = {
  loginPage: LoginPage;
  navBar: NavBarComponent;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  contactPage: ContactPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  navBar: async ({ page }, use) => {
    await use(new NavBarComponent(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from '@playwright/test';
