// spec: spec/ui/pim/add-employee.spec.ts
// pattern: Page Object Model
// Story: KAN-7 — Add Employee

import { test, expect } from '@playwright/test';
import { AddEmployeePage } from '../../../libs/pages/pim/AddEmployeePage';
import { EmployeeListPage } from '../../../libs/pages/pim/EmployeeListPage';

test.describe('KAN-7 — Add Employee', () => {
  test.setTimeout(60000);

  let addEmployeePage: AddEmployeePage;

  test.beforeEach(async ({ page }) => {
    addEmployeePage = new AddEmployeePage(page);
    await addEmployeePage.navigate();
  });

  test('KAN-7-TC01: Add employee with mandatory fields creates record', async ({ page }) => {
    const suffix = Date.now();
    const firstName = `QAFirst${suffix}`;
    const lastName = `QALast${suffix}`;
    const employeeId = `QA${String(suffix).slice(-5)}`;

    await addEmployeePage.fillMandatoryFields(firstName, lastName, employeeId);
    await addEmployeePage.save();

    // Should redirect to the employee profile
    await expect(page).toHaveURL(/pim\/viewPersonalDetails\/empNumber\//);

    // Verify the employee appears in search — use Employee ID (plain input, not autocomplete)
    const listPage = new EmployeeListPage(page);
    await listPage.navigate();
    await listPage.searchByEmployeeId(employeeId);
    const rowCount = await listPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(listPage.tableRows.first()).toContainText(employeeId, { timeout: 10000 });
  });

  test('KAN-7-TC02: Add employee without First Name shows validation error', async ({ page }) => {
    const suffix = Date.now();
    // Leave First Name empty, fill the rest
    await addEmployeePage.lastNameInput.fill(`QALast${suffix}`);
    await addEmployeePage.saveButton.click();

    // Validation error should appear on First Name field
    const firstNameGroup = page.locator('.oxd-input-group', { hasText: 'First Name' }).first()
      || page.locator('.oxd-form-row').first();
    await expect(page.getByText('Required')).toBeVisible();
    // Confirm we did NOT navigate away to a profile page
    await expect(page).not.toHaveURL(/viewPersonalDetails/);
  });

  test('KAN-7-TC03: Add employee without Last Name shows validation error', async ({ page }) => {
    const suffix = Date.now();
    await addEmployeePage.firstNameInput.fill(`QAFirst${suffix}`);
    // Leave Last Name empty
    await addEmployeePage.saveButton.click();

    await expect(page.getByText('Required')).toBeVisible();
    await expect(page).not.toHaveURL(/viewPersonalDetails/);
  });
});
