import { test, expect } from '../../fixtures/pages.fixture';

/**
 * UI — Product detail
 *
 * Playwright features:
 *  - page.waitForRequest()
 *  - expect(locator).toContainText() / toHaveText()
 *  - storageState for authenticated favourites
 */

test.describe('Product detail — guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('navigate from search results to product detail', async ({ homePage, productPage }) => {
    await homePage.goto();
    await homePage.search('pliers');
    const name = (await homePage.productNames.first().innerText()).trim();
    await homePage.productCards.first().click();

    await expect(productPage.page).toHaveURL(/\/product\//);
    await expect(productPage.name).toContainText(name);
    await expect(productPage.description).not.toBeEmpty();
    await expect(productPage.unitPrice).toBeVisible();
  });

  test('add an in-stock product to the cart', async ({ homePage, productPage, navBar }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();

    await expect(productPage.addToCartButton).toBeEnabled();
    await productPage.addToCart();
    await expect(navBar.cartQuantity).toHaveText(/[1-9]/);
  });

  test('out-of-stock badge is visible for unavailable products', async ({ homePage, productPage }) => {
    await homePage.goto();
    await expect(homePage.outOfStockCards().first()).toBeVisible();
    await homePage.outOfStockCards().first().click();
    await expect(productPage.outOfStock).toBeVisible();
    await expect(productPage.addToCartButton).toBeDisabled();
  });

  test('CO₂ rating badge is displayed', async ({ homePage, productPage }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await expect(productPage.co2Badge).toBeVisible();
  });

  test('related products section is listed', async ({ homePage, productPage }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await expect.soft(productPage.relatedHeading).toBeVisible();
    await expect(productPage.relatedProducts.first()).toBeVisible();
  });
});

test.describe('Product detail — authenticated customer', () => {
  test.use({ storageState: '.auth/customer.json' });

  test('add product to favourites', async ({ homePage, productPage, page }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await productPage.addToFavorites();
    await expect(page.locator('.toast-success, .toast-error').first()).toBeVisible();
  });
});
