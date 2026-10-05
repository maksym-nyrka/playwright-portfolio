import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — Page Object for the /auth/login route.
 * Encapsulates all selectors and actions related to authentication.
 */
export class LoginPage extends BasePage {
  // Locators defined as readonly class properties — easy to maintain
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.navigate('/auth/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill in credentials and submit the login form.
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Convenience: full login flow and wait for redirect.
   */
  async loginAs(email: string, password: string) {
    await this.goto();
    await this.login(email, password);
    // Wait for redirect away from /auth/login on success
    await this.page.waitForURL(url => !url.pathname.includes('/auth/login'));
  }
}
