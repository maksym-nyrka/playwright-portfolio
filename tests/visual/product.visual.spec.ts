import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Visual Regression: Product Page', () => {
  test('should match the visual baseline for the product detail page', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();

    // Mask dynamic elements like stock levels or prices if they vary
    await expect(page).toHaveScreenshot('product-detail.png', {
      mask: [
        page.locator('.product-price'),
        page.locator('.stock-level'), // If applicable
      ],
      threshold: 0.2,
    });
  });

  test('should match the visual baseline for the CO2 badge', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();

    // Use a broad selector to find the badge.
    // We look for elements that might be the CO2 badge based on common patterns
    // (e.g., containing 'rating', 'badge', or 'co2' in class/id)
    const co2Badge = page.locator('[class*="badge"], [id*="badge"], [class*="rating"], [id*="rating"], [class*="co2"], [id*="co2"]').first();

    await expect(co2Badge).toBeVisible({ timeout: 10000 });
    await expect(co2Badge).toHaveScreenshot('co2-badge.png');
  });
});