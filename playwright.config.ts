import { defineConfig, devices } from '@playwright/test';
import { appBaseURL, useLocalToolshop } from './utils/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  /**
   * Playwright feature: globalSetup
   * Runs once before any test project. Pre-authenticates both roles
   * and saves storageState files so tests can restore sessions instantly.
   */
  // globalSetup: require.resolve('./tests/global.setup'),

  /**
   * GitHub-hosted runners are challenged by Cloudflare on the live demo.
   * Start an isolated Toolshop instance for CI and point the suite at it.
   * `scripts/start-toolshop.sh` keeps running until Playwright shuts it down,
   * then removes the containers and volumes it created.
   */
  webServer: useLocalToolshop
    ? {
        command: 'bash scripts/start-toolshop.sh',
        url: appBaseURL,
        reuseExistingServer: false,
        timeout: 15 * 60 * 1000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,

  use: {
    baseURL: appBaseURL,
    // Site uses data-test="..." not data-testid="..."
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    /* Cross-browser configurations kept for future multi-browser runs:
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    */
  ],
});
