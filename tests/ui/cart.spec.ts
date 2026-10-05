import { test, expect } from '../../fixtures/pages.fixture';

/**
 * UI — Cart
 *
 * Playwright features:
 *  - chained locator actions
 *  - expect(locator).toHaveValue()
 */

test.describe('Cart', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage, productPage }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await productPage.addToCart();
  });

  test('added product appears in the cart', async ({ navBar, cartPage }) => {
    await navBar.cartLink.click();
    await expect(cartPage.page).toHaveURL(/\/checkout/);
    await expect(cartPage.productTitle.first()).toBeVisible();
    await expect(cartPage.proceedToCheckout).toBeEnabled();
  });

  test('update item quantity', async ({ navBar, cartPage }) => {
    await navBar.cartLink.click();
    await cartPage.setQuantity(2);
    await expect(cartPage.quantityInput.first()).toHaveValue('2');
  });

  test('remove item leaves an empty cart', async ({ navBar, cartPage }) => {
    await navBar.cartLink.click();
    await cartPage.removeFirstItem();
    await expect(cartPage.productTitle).toHaveCount(0);
    await expect(cartPage.page.getByText(/empty/i)).toBeVisible();
  });

  test('proceed to checkout button is available', async ({ navBar, cartPage }) => {
    await navBar.cartLink.click();
    await expect(cartPage.proceedToCheckout).toBeVisible();
    await cartPage.proceedToCheckout.click();
    await expect(cartPage.proceedToCheckout).toBeHidden();
  });

  test('cart persists across SPA navigation', async ({ navBar, cartPage, homePage }) => {
    await navBar.cartLink.click();
    const title = (await cartPage.productTitle.first().innerText()).trim();

    await navBar.homeLink.click();
    await expect(homePage.productCards.first()).toBeVisible();

    await navBar.cartLink.click();
    await expect(cartPage.productTitle.first()).toContainText(title);
  });
});
