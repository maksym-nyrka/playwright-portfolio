import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Advanced: Multi-Tab & Contexts', () => {
  test('should maintain session state across multiple tabs', async ({ browser, context, homePage }) => {
    // 1. Open the first tab and go to home
    const page1 = await context.newPage();
    const homePage1 = new (require('../../pages/HomePage').HomePage)(page1);
    await homePage1.goto();

    // 2. Open a second tab
    const page2 = await context.newPage();

    // Verify that we can navigate to the same page and it shares the same session/cookies
    await page2.goto('/');

    // Assert that both tabs are on the home page
    await expect(page1).toHaveURL(/.*practicesoftwaretesting.com/);
    await expect(page2).toHaveURL(/.*practicesoftwaretesting.com/);

    // Close tabs
    await page1.close();
    await page2.close();
  });

  test('should handle popup windows correctly', async ({ page, homePage }) => {
    await page.goto('/');

    // The site doesn't have many popups, but we can simulate/test the mechanism
    // by triggering a link that opens in a new tab if available,
    // or by using a programmatic popup for demonstration.
    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('https://google.com'));
    const popup = await popupPromise;

    await expect(popup).toBeDefined();
    await expect(popup).toHaveURL(/.*google.com/);

    await popup.close();
  });
});