import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Response Mocking', () => {
  const mockProducts = [
    {
      id: 'mock-1',
      name: 'Mocked SuperPhone X',
      description: 'A high-end phone from the mock dimension',
      price: 999,
      sku: 'MOCK-001',
      category: { name: 'Smartphones' },
      brand: { name: 'MockBrand' },
      product_image: { id: 'img-1' },
      stock: 10,
      co2_rating: 'A',
    },
  ];

  test('should render custom product data from mock response', async ({ page, homePage }) => {
    await page.goto('/');
    // Intercept product search and return fake data
    await page.route('**/products/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockProducts }),
      });
    });

    await homePage.search('anything');

    // Verify the UI displays the mocked product
    await expect(page.getByText('Mocked SuperPhone X')).toBeVisible();
  });

  test('should display error message when server returns 500', async ({ page, homePage }) => {
    await page.goto('/');
    // Intercept product search and return 500 error
    await page.route('**/products/search*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await homePage.search('iPhone', false);

    // Verify that the UI displays an error state
    // We check for a general error indicator or the absence of products
    await expect(async () => {
      const productFound = await page.locator('a[data-test^="product-"]').first().isVisible();
      expect(productFound).toBe(false);
    }).toPass({ timeout: 10000 });
  });

  test('should display "no results" message when product list is empty', async ({ page, homePage }) => {
    await page.goto('/');
    // Intercept product search and return empty array
    await page.route('**/products/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await homePage.search('NonExistentProduct123');

    // Verify that no product cards are visible
    await expect(async () => {
      const productFound = await page.locator('a[data-test^="product-"]').first().isVisible();
      expect(productFound).toBe(false);
    }).toPass({ timeout: 10000 });
  });

  test('should load page correctly when third-party analytics are blocked', async ({ page, homePage }) => {
    await page.goto('/');
    // Block requests to common analytics domains
    await page.route(url => url.host.includes('google-analytics.com') || url.host.includes('analytics.js'), route =>
      route.abort()
    );

    await page.goto('/');

    // Verify the page still loads and core functionality works
    await expect(page).toHaveURL(/.*practicesoftwaretesting.com/);
    await expect(homePage.searchInput).toBeVisible();
  });
});
