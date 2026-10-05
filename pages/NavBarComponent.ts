import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * NavBarComponent — reusable navigation bar locators.
 * Demonstrates component-level POM pattern (not just full pages).
 *
 * Real data-test attributes confirmed from practicesoftwaretesting.com v5:
 *   nav-sign-in, nav-menu, nav-sign-out
 */
export class NavBarComponent extends BasePage {
  readonly navMenu: Locator;
  readonly signInLink: Locator;
  readonly accountDropdown: Locator;
  readonly logoutButton: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;
  readonly contactLink: Locator;
  readonly homeLink: Locator;

  /** Alias kept for backwards compatibility with tests */
  get accountMenu() { return this.accountDropdown; }

  constructor(page: Page) {
    super(page);
    this.signInLink = page.getByTestId('nav-sign-in');
    // The account menu button appears after login (shows user name)
    this.accountDropdown = page.getByTestId('nav-menu');
    this.logoutButton = page.getByTestId('nav-sign-out');
    this.navMenu = page.getByRole('navigation');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.contactLink = page.getByTestId('nav-contact');
    this.homeLink = page.getByTestId('nav-home');
  }

  async logout() {
    await this.accountDropdown.click();
    await this.logoutButton.click();
    // Site redirects to homepage after sign-out, not /auth/login
    await this.page.waitForURL(url => !url.pathname.includes('/auth/login') && url.pathname === '/');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.accountDropdown.isVisible();
  }
}
