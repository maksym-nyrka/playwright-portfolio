import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Visual Regression: Home Page', () => {
  test('should match the visual baseline for the home page', async ({ page, homePage }) => {
    await homePage.goto();

    // Mask dynamic content to prevent flakiness
    // Masking prices and the search result count which can change frequently
    await expect(page).toHaveScreenshot('home-page.png', {
      mask: [
        page.getByTestId('search-result-count'),
        page.locator('.product-price'),
        page.locator('.out-of-stock'),
      ],
      threshold: 0.2, // Allow slight color variations
    });
  });

  test('should match the visual baseline for the search results view', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.search('iPhone');

    await expect(page).toHaveScreenshot('search-results.png', {
      mask: [
        page.getByTestId('search-result-count'),
        page.locator('.product-price'),
      ],
      threshold: 0.2,
    });
  });
});