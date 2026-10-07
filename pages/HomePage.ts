import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — product overview with search, filters, sort, and pagination.
 */
export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly searchCaption: Locator;
  readonly searchTerm: Locator;
  readonly searchResultCount: Locator;
  readonly noResults: Locator;
  readonly sortSelect: Locator;
  readonly ecoFriendlyFilter: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly compareButtons: Locator;
  readonly comparisonBar: Locator;
  readonly compareLink: Locator;
  readonly priceSliderMax: Locator;
  readonly priceSliderMin: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchTerm = page.getByTestId('search-term');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResults = page.getByTestId('no-results');
    this.sortSelect = page.getByTestId('sort');
    this.ecoFriendlyFilter = page.getByTestId('eco-friendly-filter');
    this.paginationNext = page.getByTestId('pagination-next');
    this.paginationPrev = page.getByTestId('pagination-prev');
    this.productCards = page.locator('a[data-test^="product-"]');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.compareButtons = page.getByTestId('compare-btn');
    this.comparisonBar = page.getByTestId('comparison-bar');
    this.compareLink = page.getByTestId('compare-link');
    this.priceSliderMax = page.locator('.ngx-slider-pointer-max');
    this.priceSliderMin = page.locator('.ngx-slider-pointer-min');
  }

  async goto() {
    await this.navigate('/');
    await this.waitForPageLoad();
    await this.productCards.first().waitFor({ state: 'visible' });
  }

  inStockCards(): Locator {
    return this.productCards.filter({ hasNot: this.page.getByTestId('out-of-stock') });
  }

  outOfStockCards(): Locator {
    return this.productCards.filter({ has: this.page.getByTestId('out-of-stock') });
  }

  categoryCheckbox(name: string): Locator {
    return this.page.locator('label').filter({ hasText: name }).locator('input[name="category_id"]');
  }

  brandCheckbox(name: string): Locator {
    return this.page.locator('label').filter({ hasText: name }).locator('input[name="brand_id"]');
  }

  async search(query: string, waitForOk = true) {
    await this.searchInput.fill(query, { force: true });

    // To ensure the search is triggered regardless of Angular's internal state,
    // we combine a click and a keyboard Enter press.
    const [response] = await Promise.all([
      this.page.waitForResponse((res) => {
        const isSearch = res.url().includes('/products/search');
        return waitForOk ? (isSearch && res.ok()) : isSearch;
      }, { timeout: 15000 }),
      (async () => {
        await this.searchSubmit.click({ force: true });
        await this.page.keyboard.press('Enter');
      })()
    ]);

    return response;
  }

  async sortBy(value: 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc') {
    const firstPrice = await this.productPrices.first().innerText();
    await this.sortSelect.selectOption(value);
    await expect(this.productPrices.first()).not.toHaveText(firstPrice);
  }

  async filterByCategory(name: string) {
    await this.categoryCheckbox(name).check();
  }

  async filterByBrand(name: string) {
    await this.brandCheckbox(name).check();
  }

  async filterEcoFriendly() {
    await this.ecoFriendlyFilter.check();
  }

  async goToNextPage() {
    const firstProductName = await this.productNames.first().innerText();
    await this.paginationNext.click();
    await expect(this.productNames.first()).not.toHaveText(firstProductName);
  }

  async goToPreviousPage() {
    const firstProductName = await this.productNames.first().innerText();
    await this.paginationPrev.click();
    await expect(this.productNames.first()).not.toHaveText(firstProductName);
  }

  async openFirstInStockProduct() {
    await this.inStockCards().first().click();
    await this.page.waitForURL(/\/product\//);
  }

  /**
   * Drag the max price handle toward the min handle to narrow the range.
   */
  async narrowMaxPrice() {
    await this.priceSliderMax.focus();
    for (let i = 0; i < 10; i += 1) {
      await this.priceSliderMax.press('ArrowLeft');
    }
  }
}
