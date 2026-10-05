import { test, expect } from '../../fixtures/pages.fixture';

/**
 * UI — Search, filters, sort, pagination, compare
 *
 * Playwright features:
 *  - page.waitForResponse()
 *  - locator.filter()
 *  - expect(locator).toHaveCount()
 */

test.describe('Search and filters', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('search by keyword shows matching products', async ({ homePage }) => {
    await homePage.goto();
    await homePage.search('hammer');

    await expect(homePage.searchTerm).toHaveText('hammer');
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(homePage.productNames.filter({ hasText: /hammer/i }).first()).toBeVisible();
  });

  test('search with no matches shows empty state', async ({ homePage }) => {
    await homePage.goto();
    await homePage.search('zzznomatchxyz');

    await expect(homePage.noResults).toBeVisible();
    await expect(homePage.productCards).toHaveCount(0);
  });

  test('filter by category reduces the product list', async ({ homePage }) => {
    await homePage.goto();
    const before = await homePage.productCards.count();

    await homePage.filterByCategory('Hammer');

    await expect(homePage.productCards.first()).toBeVisible();
    const after = await homePage.productCards.count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(before);
    await expect(homePage.productNames.filter({ hasText: /hammer/i }).first()).toBeVisible();
  });

  test('filter by brand shows that brand\'s products', async ({ homePage }) => {
    await homePage.goto();
    await homePage.filterByBrand('ForgeFlex Tools');
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(homePage.productCards).not.toHaveCount(0);
  });

  test('price range slider updates results', async ({ homePage }) => {
    await homePage.goto();
    await homePage.narrowMaxPrice();
    await expect(homePage.productCards.first()).toBeVisible();

    const prices = await homePage.productPrices.allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const text of prices) {
      const value = Number(text.replace(/[^0-9.]/g, ''));
      expect(value).toBeLessThan(100);
    }
  });

  test('sort by price ascending then descending', async ({ homePage }) => {
    await homePage.goto();

    await homePage.sortBy('price,asc');
    const ascending = (await homePage.productPrices.allTextContents()).map((t) =>
      Number(t.replace(/[^0-9.]/g, '')),
    );
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    await homePage.sortBy('price,desc');
    const descending = (await homePage.productPrices.allTextContents()).map((t) =>
      Number(t.replace(/[^0-9.]/g, '')),
    );
    expect(descending).toEqual([...descending].sort((a, b) => b - a));
  });

  test('paginate to the next page and back', async ({ homePage }) => {
    await homePage.goto();
    const firstPageNames = await homePage.productNames.allTextContents();

    await homePage.goToNextPage();
    const secondPageNames = await homePage.productNames.allTextContents();
    expect(secondPageNames).not.toEqual(firstPageNames);

    await homePage.goToPreviousPage();
    await expect(homePage.productNames.first()).toHaveText(firstPageNames[0]);
  });

  test('eco-friendly filter returns products', async ({ homePage }) => {
    await homePage.goto();
    await homePage.filterEcoFriendly();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('compare two products from the overview', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.compareButtons.nth(0).click();
    await homePage.compareButtons.nth(1).click();

    await expect(homePage.comparisonBar).toBeVisible();
    await homePage.compareLink.click();
    await expect(page).toHaveURL(/\/comparison/);
    await expect(page.getByTestId('comparison-table')).toBeVisible();
    await expect(page.getByTestId('product-name')).toHaveCount(2);
  });
});
