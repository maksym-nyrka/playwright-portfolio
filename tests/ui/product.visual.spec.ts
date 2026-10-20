import { test, expect } from '../../fixtures/pages.fixture';

/**
 * The catalogue on the shared demo site is mutable (other users create and
 * delete products), so the "first in stock" product changes between runs.
 * Always open the same seeded product to keep the baselines stable.
 */
const PRODUCT_NAME = 'Combination Pliers';

test.describe('Visual Regression: Product Page', () => {
  test.beforeEach(async ({ page, homePage, productPage }) => {
    /**
     * Stock levels change as visitors buy products on the shared demo. The
     * out-of-stock notice adds a row and disables the "Add to cart" button,
     * which changes the layout, so normalise the product to be in stock.
     */
    await page.route(
      (url) => /^\/products\/[^/]+$/.test(url.pathname),
      async (route) => {
        const response = await route.fetch();
        const product = await response.json();
        await route.fulfill({ response, json: { ...product, in_stock: true } });
      },
    );

    await homePage.goto();
    await homePage.productCards.filter({ hasText: PRODUCT_NAME }).first().click();
    await page.waitForURL(/\/product\//);
    await expect(productPage.name).toHaveText(PRODUCT_NAME);

    // Make sure the product photo has finished loading before screenshotting.
    await expect
      .poll(() =>
        page
          .locator('app-detail .row.my-3 img')
          .first()
          .evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);

    // The CO2 rating renders asynchronously and adds a row of height to the
    // hero section, so wait for it or the screenshot can be taken mid-layout.
    await expect(productPage.co2Badge).toBeVisible({ timeout: 10000 });
  });

  test('should match the visual baseline for the product detail page', async ({ page }) => {
    // Scope the screenshot to the product hero row. The full page also contains
    // a "Related products" list that changes whenever other users add products.
    const productDetail = page.locator('app-detail .row.my-3');

    await expect(productDetail).toHaveScreenshot('product-detail.png', {
      mask: [
        page.locator('.price-section'),
        page.getByTestId('out-of-stock'),
      ],
      threshold: 0.2,
    });
  });

  test('should match the visual baseline for the CO2 badge', async ({ productPage }) => {
    await expect(productPage.co2Badge).toBeVisible({ timeout: 10000 });
    await expect(productPage.co2Badge).toHaveScreenshot('co2-badge.png');
  });
});
