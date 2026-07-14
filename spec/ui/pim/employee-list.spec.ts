// spec: spec/ui/pim/employee-list.spec.ts
// pattern: Page Object Model

import { test, expect } from '@playwright/test';
import { EmployeeListPage } from '../../../libs/pages/pim/EmployeeListPage';

test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe('PIM — Employee List', () => {
  // TC-030: Employee List table renders on load
  test('TC-030: navigate to Employee List — table renders with column headers and at least one row', async ({
    page,
  }) => {
    const employeeListPage = new EmployeeListPage(page);

    // Step 1: Navigate to the Employee List page
    await employeeListPage.navigate();

    // Step 2: Confirm the table is visible
    const tableVisible = await employeeListPage.isTableVisible();
    expect(tableVisible).toBe(true);

    // Step 3: Confirm column headers are present
    const headers = await employeeListPage.getColumnHeaders();
    expect(headers.length).toBeGreaterThan(0);

    // Step 4: Confirm at least one data row is shown
    const rowCount = await employeeListPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  // TC-031: Search by employee name narrows the table
  test('TC-031: search "Ranga" — table shows employee with "Ranga" in name', async ({ page }) => {
    const employeeListPage = new EmployeeListPage(page);

    // Step 1: Navigate to the Employee List page
    await employeeListPage.navigate();

    // Step 2: Search for "Ranga"
    await employeeListPage.searchByName('Ranga');

    // Step 3: At least one row is returned
    const rowCount = await employeeListPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    // Step 4: The first result row contains the text "Ranga"
    const firstRow = employeeListPage.getTableRows().first();
    await expect(firstRow).toContainText('Ranga');
  });
});
