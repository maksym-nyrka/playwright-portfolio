import { test, expect } from '../../fixtures/pages.fixture';
import path from 'path';

test.describe.configure({ mode: 'serial' });

test.describe('HAR Replay', () => {
  const harPath = path.join(__dirname, 'search.har');

  test('should record a product search session to HAR', async ({ page, homePage }) => {
    await page.goto('/');

    // Use a mock response during recording to ensure a stable "Golden HAR"
    await page.route('**/products/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: '1', name: 'Golden Product', price: 100 }]
        }),
      });
    });

    // Use the context recording feature via routeFromHAR with update: true
    await page.routeFromHAR(harPath, {
      update: true,
    });

    await homePage.search('iPhone');
    await expect(page.locator('a[data-test^="product-"]').first()).toBeVisible({ timeout: 15000 });

    console.log(`Session recorded to ${harPath}`);
  });

  test('should replay the search session from HAR offline', async ({ page, homePage }) => {
    await page.goto('/');
    // Ensure the page is ready for interaction
    await expect(page.getByTestId('search-query')).toBeAttached();

    // Use the recorded HAR file to fulfill requests
    await page.routeFromHAR(harPath, {
      update: false,
    });

    await homePage.search('iPhone');

    // Verify the results are the same as when recorded
    await expect(page.locator('a[data-test^="product-"]').first()).toBeVisible({ timeout: 15000 });
  });
});
