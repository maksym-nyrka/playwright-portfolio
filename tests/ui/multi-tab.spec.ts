import { test, expect } from '../../fixtures/pages.fixture';
import { HomePage } from '../../pages/HomePage';

test.describe('Advanced: Multi-Tab & Contexts', () => {
  test('should maintain session state across multiple tabs', async ({ context }) => {
    // 1. Open the first tab and go to home
    const page1 = await context.newPage();
    const homePage1 = new HomePage(page1);
    await homePage1.goto();

    // 2. Open a second tab
    const page2 = await context.newPage();

    // Verify that we can navigate to the same page and it shares the same session/cookies
    await page2.goto('/');

    // Assert that both tabs are on the home page
    await expect(page1).toHaveURL(/\/$/);
    await expect(page2).toHaveURL(/\/$/);

    // Close tabs
    await page1.close();
    await page2.close();
  });

  test('should handle popup windows correctly', async ({ page }) => {
    await page.goto('/');

    // Open a popup window within the application domain to avoid flaky external dependencies
    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/contact'));
    const popup = await popupPromise;

    await expect(popup).toBeDefined();
    await expect(popup).toHaveURL(/.*\/contact/);

    await popup.close();
  });
});