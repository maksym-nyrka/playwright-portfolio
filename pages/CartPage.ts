import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CartPage — checkout wizard step 1 (cart review) at `/checkout`.
 */
export class CartPage extends BasePage {
  readonly productTitle: Locator;
  readonly quantityInput: Locator;
  readonly linePrice: Locator;
  readonly cartTotal: Locator;
  readonly proceedToCheckout: Locator;
  readonly continueShopping: Locator;
  readonly removeItemButton: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.getByTestId('product-title');
    this.quantityInput = page.getByTestId('product-quantity');
    this.linePrice = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedToCheckout = page.getByTestId('proceed-1');
    this.continueShopping = page.getByTestId('continue-shopping');
    this.removeItemButton = page.locator('table a.btn-danger');
    this.emptyMessage = page.getByText(/cart is empty/i);
  }

  async goto() {
    await this.navigate('/checkout');
    await this.waitForPageLoad();
  }

  async setQuantity(value: number) {
    await this.quantityInput.first().fill(String(value));
    await this.quantityInput.first().blur();
  }

  async removeFirstItem() {
    await this.removeItemButton.first().click();
  }
}
