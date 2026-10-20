import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Advanced: Performance', () => {
  test('should measure page load performance metrics', async ({ page }) => {
    await page.goto('/');

    // Extract performance metrics using the modern W3C Navigation Timing Level 2 API
    const loadTime = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (!nav) return 0;
      return nav.loadEventEnd > 0 ? nav.loadEventEnd - nav.startTime : nav.duration;
    });

    console.log(`Page Load Time: ${Math.round(loadTime)}ms`);

    // Assert that the page loads within a reasonable threshold
    expect(loadTime).toBeGreaterThan(0);
    expect(loadTime).toBeLessThan(10000);
  });

  test('should count network requests during product search', async ({ page, homePage }) => {
    let requestCount = 0;

    // Listen for all requests
    page.on('request', () => {
      requestCount++;
    });

    await page.goto('/');

    // Reset count after initial page load
    requestCount = 0;

    // Trigger search
    await homePage.search('iPhone');

    console.log(`Network requests during search: ${requestCount}`);

    // Assert that at least one request was made to the API
    expect(requestCount).toBeGreaterThan(0);
  });
});