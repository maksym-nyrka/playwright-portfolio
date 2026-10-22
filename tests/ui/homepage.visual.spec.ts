import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/pages.fixture';

/**
 * The product photos are lazy-loaded. Wait until every image in the viewport
 * has decoded so the screenshot is not captured mid-load.
 */
async function waitForVisibleImages(page: Page) {
  await expect
    .poll(
      () =>
        page.locator('img').evaluateAll((imgs) =>
          imgs
            .filter((img) => {
              const rect = img.getBoundingClientRect();
              return rect.top < window.innerHeight && rect.bottom > 0;
            })
            .every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}

test.describe('Visual Snapshots: Home Page', () => {
  test('should match the visual baseline for the home page', async ({ page, homePage }) => {
    await homePage.goto();
    await waitForVisibleImages(page);

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
    await waitForVisibleImages(page);

    await expect(page).toHaveScreenshot('search-results.png', {
      mask: [
        page.getByTestId('search-result-count'),
        page.locator('.product-price'),
      ],
      threshold: 0.2,
    });
  });
});