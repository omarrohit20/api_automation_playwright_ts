import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './spec',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://jsonplaceholder.typicode.com',
  },

  /* Configure projects for major browsers */
  projects: [
    // --- API projects (jsonplaceholder.typicode.com) ---
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'spec/api/**/*.spec.ts',
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: 'spec/api/**/*.spec.ts',
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: 'spec/api/**/*.spec.ts',
    },

    // --- UI auth setup (runs before pim-ui) ---
    {
      name: 'auth-setup',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'spec/ui/auth.setup.ts',
    },

    // --- PIM UI project (OrangeHRM) ---
    {
      name: 'pim-ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://opensource-demo.orangehrmlive.com',
        storageState: 'playwright/.auth/admin.json',
      },
      testMatch: 'spec/ui/pim/**/*.spec.ts',
      dependencies: ['auth-setup'],
    },
  ],

  /* Global setup */
  globalSetup: require.resolve('./global-setup.ts'),
});
