import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductPage — product detail route `/product/:id`.
 */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly description: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToFavoritesButton: Locator;
  readonly addToCompareButton: Locator;
  readonly outOfStock: Locator;
  readonly co2Badge: Locator;
  readonly ecoBadge: Locator;
  readonly relatedHeading: Locator;
  readonly relatedProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.description = page.getByTestId('product-description');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.decreaseQuantity = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
    this.addToCompareButton = page.getByTestId('add-to-compare');
    this.outOfStock = page.getByTestId('out-of-stock');
    this.co2Badge = page.getByTestId('co2-rating-badge');
    this.ecoBadge = page.getByTestId('eco-badge');
    this.relatedHeading = page.getByRole('heading', { name: /related products/i });
    this.relatedProducts = page.locator('a.card').filter({ hasText: /more information/i });
  }

  async addToCart() {
    const request = this.page.waitForRequest(
      (req) => req.method() === 'POST' && /\/carts(\/|$)/.test(req.url()),
    );
    await this.addToCartButton.click();
    await request;
  }

  async addToFavorites() {
    const request = this.page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().includes('/favorites'),
    );
    await this.addToFavoritesButton.click();
    await request;
  }
}
