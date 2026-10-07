import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Advanced: Performance', () => {
  test('should measure page load performance metrics', async ({ page }) => {
    await page.goto('/');

    // Extract performance metrics using the Navigation Timing API
    const performanceTiming = await page.evaluate(() => {
      const t = window.performance.timing;
      return {
        loadEventEnd: t.loadEventEnd,
        loadEventStart: t.loadEventStart,
        domComplete: t.domComplete,
        domInteractive: t.domInteractive,
        navigationStart: t.navigationStart,
      };
    });

    // Calculate Page Load Time (PLT)
    const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    console.log(`Page Load Time: ${loadTime}ms`);

    // Assert that the page loads within a reasonable threshold for a portfolio demo
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