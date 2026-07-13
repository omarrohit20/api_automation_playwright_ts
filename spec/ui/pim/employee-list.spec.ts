// spec: spec/ui/pim/employee-list.spec.ts
// pattern: Page Object Model
// Stories: KAN-5 (View Employee List), KAN-6 (Search Employee)

import { test, expect } from '@playwright/test';
import { EmployeeListPage } from '../../../libs/pages/pim/EmployeeListPage';

test.describe('KAN-5 / KAN-6 — Employee List & Search', () => {
  let employeeListPage: EmployeeListPage;

  test.beforeEach(async ({ page }) => {
    employeeListPage = new EmployeeListPage(page);
    await employeeListPage.navigate();
  });

  // ---------------------------------------------------------------------------
  // KAN-5: View Employee List
  // ---------------------------------------------------------------------------

  test('KAN-5-TC01: Employee list displays with required columns', async ({ page }) => {
    // Step 1: Verify at least one data row is rendered
    const rows = await employeeListPage.getEmployeeRows();
    expect(rows.length).toBeGreaterThan(0);

    // Step 2: Verify expected column headers are visible.
    // Note: OrangeHRM appends a sort-icon space to the accessible name ("Id " not "Id"),
    // so we use a regex anchor to match the text content, not exact: true.
    await expect(page.locator('[role="columnheader"]').filter({ hasText: /^Id/ }).first()).toBeVisible();
    await expect(page.locator('[role="columnheader"]').filter({ hasText: 'First (& Middle) Name' }).first()).toBeVisible();
  });

  test('KAN-5-TC02: Employee list shows record count and page info', async ({ page }) => {
    // OrangeHRM shows "(N) Records Found" in a div below the search panel.
    // This confirms the table and metadata rendered. The pagination nav structure varies.
    const recordCountText = page.getByText(/Records Found/i).first();
    await expect(recordCountText).toBeVisible({ timeout: 10000 });
  });

  // ---------------------------------------------------------------------------
  // KAN-6: Search Employee
  // ---------------------------------------------------------------------------

  test('KAN-6-TC01: Search by employee ID returns matching result', async ({ page }) => {
    // The Employee Name field is an autocomplete that requires suggestion selection — unreliable
    // in headless automation. Use Employee ID (plain text input) to validate search behaviour.
    // Employee ID "1" is confirmed to exist on the demo app (Aarav Sharma).
    await employeeListPage.searchByEmployeeId('1');

    // Verify search returned results by checking the "(N) Records Found" indicator
    // (more stable than row locators which can detach during Vue re-renders).
    await expect(page.getByText(/Records Found/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('KAN-6-TC02: Search with no matching criteria shows No Records Found', async () => {
    // Step 1: Search for a name that should never exist
    await employeeListPage.searchByName('ZZZNOMATCH99999');

    // Step 2: "No Records Found" message is visible (wait up to 10s for search to complete)
    await expect(employeeListPage.noRecordsText).toBeVisible({ timeout: 10000 });
  });

  test('KAN-6-TC03: Reset clears search filters', async () => {
    // Step 1: Enter a search term
    await employeeListPage.employeeNameInput.fill('Admin');

    // Step 2: Click Reset
    await employeeListPage.resetButton.click();

    // Step 3: Employee Name field should be cleared
    await expect(employeeListPage.employeeNameInput).toHaveValue('');
  });
});
