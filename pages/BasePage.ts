import { Page } from '@playwright/test';

/**
 * BasePage — shared functionality inherited by all Page Objects.
 * Demonstrates the POM base class pattern.
 */
export class BasePage {
  constructor(public readonly page: Page) {}

  /**
   * Navigate to a path relative to the base URL.
   */
  async navigate(path = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for network to be idle (useful after SPA navigation).
   */
  async waitForPageLoad() {
    // 'domcontentloaded' is more reliable than 'networkidle' on Angular SPAs
    // which have persistent background polling preventing networkidle from firing.
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
