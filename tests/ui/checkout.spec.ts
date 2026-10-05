import { test, expect } from '../../fixtures/pages.fixture';
import { billingAddress, guestCheckout } from '../../utils/test-data';

/**
 * UI — Checkout
 *
 * Playwright features:
 *  - test.step()
 *  - page.waitForURL()
 *  - storageState to skip login
 */

test.describe('Checkout — authenticated customer', () => {
  test.use({ storageState: '.auth/customer.json' });

  test('complete checkout with cash on delivery', async ({
    homePage,
    productPage,
    navBar,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('Add a product and open the cart', async () => {
      await homePage.goto();
      await homePage.openFirstInStockProduct();
      await productPage.addToCart();
      await navBar.cartLink.click();
      await expect(cartPage.page).toHaveURL(/\/checkout/);
    });

    await test.step('Step 1: cart review', async () => {
      await expect(cartPage.productTitle.first()).toBeVisible();
      await cartPage.proceedToCheckout.click();
    });

    await test.step('Step 2: already signed in', async () => {
      await expect(checkoutPage.proceedSignIn).toBeEnabled();
      await checkoutPage.proceedSignIn.click();
    });

    await test.step('Step 3: billing address', async () => {
      await expect(checkoutPage.street).toBeVisible();
      if (await checkoutPage.proceedAddress.isDisabled()) {
        await checkoutPage.fillAddress(billingAddress);
      }
      await expect(checkoutPage.proceedAddress).toBeEnabled();
      await checkoutPage.proceedAddress.click();
    });

    await test.step('Step 4: payment and confirmation', async () => {
      await checkoutPage.payWithCashOnDelivery();
      await expect(checkoutPage.orderConfirmation.or(checkoutPage.paymentSuccess)).toBeVisible();
    });
  });
});

test.describe('Checkout — guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('guest can start checkout after filling identity', async ({
    homePage,
    productPage,
    navBar,
    cartPage,
    checkoutPage,
  }) => {
    const guest = guestCheckout();

    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await productPage.addToCart();
    await navBar.cartLink.click();

    await cartPage.proceedToCheckout.click();
    await checkoutPage.fillGuestDetails(guest.email, guest.firstName, guest.lastName);
    await expect(checkoutPage.proceedGuest).toBeEnabled();
    await checkoutPage.proceedGuest.click();
    await expect(checkoutPage.street).toBeVisible();
  });
});

test.describe('Checkout — validation', () => {
  test.use({ storageState: '.auth/customer.json' });

  test('cannot proceed from payment without a method', async ({
    homePage,
    productPage,
    navBar,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.goto();
    await homePage.openFirstInStockProduct();
    await productPage.addToCart();
    await navBar.cartLink.click();
    await cartPage.proceedToCheckout.click();
    await checkoutPage.proceedSignIn.click();
    if (await checkoutPage.proceedAddress.isDisabled()) {
      await checkoutPage.fillAddress(billingAddress);
    }
    await checkoutPage.proceedAddress.click();

    await expect(checkoutPage.finish).toBeDisabled();
    await expect(checkoutPage.paymentMethod).toHaveValue('');
  });
});
