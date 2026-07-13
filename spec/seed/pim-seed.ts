/**
 * PIM Seed Script — Epic KAN-4
 *
 * Provides seedEmployee() and cleanupEmployee() helpers that create / delete
 * an OrangeHRM test employee via browser automation.  The created employee's
 * data is persisted to spec/seed/seed-data.json so specs can reference it.
 *
 * Usage (standalone):
 *   npx ts-node spec/seed/pim-seed.ts
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
const SEED_DATA_PATH = path.join(__dirname, 'seed-data.json');

interface SeedData {
  firstName: string;
  lastName: string;
  employeeId: string;
  profileUrl: string;
}

export async function seedEmployee(): Promise<SeedData> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // --- Log in ---
    await page.goto(`${BASE_URL}/web/index.php/auth/login`);
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard/**');

    // --- Navigate to Add Employee ---
    await page.goto(`${BASE_URL}/web/index.php/pim/addEmployee`);
    await page.waitForLoadState('networkidle');

    const firstName = 'TestQA';
    const lastName = `QA${Date.now()}`;

    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);

    // Read the auto-generated Employee ID before saving
    const employeeIdInput = page
      .locator('.oxd-input-group', { hasText: 'Employee Id' })
      .getByRole('textbox');
    const employeeId = await employeeIdInput.inputValue();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL('**/pim/viewPersonalDetails/empNumber/**');

    const profileUrl = page.url();

    const seedData: SeedData = { firstName, lastName, employeeId, profileUrl };
    fs.writeFileSync(SEED_DATA_PATH, JSON.stringify(seedData, null, 2), 'utf-8');
    console.log('[pim-seed] Created employee:', seedData);

    return seedData;
  } finally {
    await browser.close();
  }
}

export async function cleanupEmployee(employeeId: string): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // --- Log in ---
    await page.goto(`${BASE_URL}/web/index.php/auth/login`);
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard/**');

    // --- Search for the employee by ID ---
    await page.goto(`${BASE_URL}/web/index.php/pim/viewEmployeeList`);
    await page.waitForLoadState('networkidle');

    const employeeIdInput = page
      .locator('.oxd-input-group', { hasText: 'Employee Id' })
      .getByRole('textbox');
    await employeeIdInput.fill(employeeId);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle');

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    const count = await rows.count();
    if (count === 0) {
      console.log(`[pim-seed] Employee ${employeeId} not found — skipping cleanup.`);
      return;
    }

    // Select the checkbox and delete
    await rows.first().locator('input[type="checkbox"]').check();
    await page.locator('button.oxd-icon-button.oxd-table-header-bulk-action-btn').click();
    await page.getByRole('button', { name: 'Yes, Delete' }).click();
    await page.waitForLoadState('networkidle');

    console.log(`[pim-seed] Deleted employee ${employeeId}.`);

    // Clean up seed file if it matches the deleted employee
    if (fs.existsSync(SEED_DATA_PATH)) {
      const saved: SeedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));
      if (saved.employeeId === employeeId) {
        fs.unlinkSync(SEED_DATA_PATH);
      }
    }
  } finally {
    await browser.close();
  }
}

// Allow running as a standalone script
if (require.main === module) {
  seedEmployee()
    .then((data) => {
      console.log('[pim-seed] Seed complete:', data);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[pim-seed] Seed failed:', err);
      process.exit(1);
    });
}
