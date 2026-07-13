// spec: spec/ui/auth.setup.ts
// Logs into OrangeHRM and saves auth state so pim-ui tests skip the login step.

import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join(__dirname, '../../playwright/.auth/admin.json');

setup('authenticate as Admin', async ({ page }) => {
  const rawCredentials = process.env.DEV_APP_CREDENTIALS ?? '{"username":"Admin","password":"admin123"}';
  const credentials: { username: string; password: string } = JSON.parse(rawCredentials);

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

  await page.getByPlaceholder('Username').fill(credentials.username);
  await page.getByPlaceholder('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/dashboard/**');

  // Ensure the auth directory exists before saving
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: AUTH_FILE });
});
