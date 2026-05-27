// global-setup.ts - Playwright global setup configuration
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // You can add any global setup logic here
  // For example: initializing test data, authenticating, etc.
  console.log('Global setup: Starting tests...');
}

export default globalSetup;
