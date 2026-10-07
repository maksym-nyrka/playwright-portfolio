import { test, expect } from '../../fixtures/pages.fixture';
import { Request } from '@playwright/test';

test.describe('Network Interception', () => {
  test('should send correct request parameters when searching for products', async ({ page, homePage }) => {
    await page.goto('/');
    const searchQuery = 'iPhone';
    let capturedRequest: Request | null = null;

    // Use route to capture the request without blocking it
    await page.route('**/products/search*', async route => {
      capturedRequest = route.request();
      await route.continue();
    });

    // Trigger the action
    await homePage.search(searchQuery);

    // Assert that the request was captured
    expect(capturedRequest).not.toBeNull();

    // Assert request parameters
    const url = new URL(capturedRequest!.url());
    const body = JSON.parse(await capturedRequest!.postData() || '{}');

    expect(capturedRequest!.method()).toBe('QUERY');
    expect(body.q).toBe(searchQuery);
  });
});
