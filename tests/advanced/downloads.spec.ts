import { test, expect } from '../../fixtures/pages.fixture';
import fs from 'fs';
import path from 'path';

test.describe('Advanced: Downloads', () => {
  test('should successfully download a file', async ({ page }) => {
    await page.goto('/');

    // Trigger a download using a blob URL which is more stable in Playwright
    const downloadPromise = page.waitForEvent('download');

    await page.evaluate(() => {
      const blob = new Blob(['Hello Playwright!'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test-download.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-download.txt');

    const filePath = path.join(__dirname, 'test-download.txt');
    await download.saveAs(filePath);

    expect(fs.existsSync(filePath)).toBe(true);

    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});