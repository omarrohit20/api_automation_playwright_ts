// spec: spec/ui/pim/employee-profile.spec.ts
// pattern: Page Object Model
// Stories: KAN-8 (Update), KAN-9 (Delete), KAN-10 (Documents)
//
// Structural notes about the OrangeHRM PIM profile (verified live):
// - Personal Details form is ALWAYS editable — no Edit/view mode toggle.
// - Attachments section is at the bottom of the Personal Details page, not a sidebar tab.
// - Delete is done from the Employee List (trash icon per row), not from the profile page.

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { AddEmployeePage } from '../../../libs/pages/pim/AddEmployeePage';
import { EmployeeListPage } from '../../../libs/pages/pim/EmployeeListPage';
import { EmployeeProfilePage } from '../../../libs/pages/pim/EmployeeProfilePage';

interface TestEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
  profileUrl: string;
}

/**
 * Creates a fresh test employee via the Add Employee page and returns its details.
 * Uses a timestamp suffix to ensure uniqueness on the shared demo app.
 */
async function createTestEmployee(page: import('@playwright/test').Page): Promise<TestEmployee> {
  const suffix = Date.now();
  const firstName = `QAFirst${suffix}`;
  const lastName = `QALast${suffix}`;
  const employeeId = `QA${String(suffix).slice(-5)}`;

  const addPage = new AddEmployeePage(page);
  await addPage.navigate();
  await addPage.fillMandatoryFields(firstName, lastName, employeeId);
  await addPage.save();
  await page.waitForURL(/pim\/viewPersonalDetails\/empNumber\//);
  const profileUrl = page.url();

  return { firstName, lastName, employeeId, profileUrl };
}

/**
 * Deletes an employee from the Employee List page using the row-level trash button.
 * This is the only supported delete path — there is no Delete button on the profile page.
 */
async function deleteFromList(
  page: import('@playwright/test').Page,
  employeeId: string,
): Promise<void> {
  const listPage = new EmployeeListPage(page);
  await listPage.navigate();
  // Use Employee ID search (plain text input) — the name field is an autocomplete
  // that requires suggestion selection and is unreliable in headless Playwright.
  await listPage.searchByEmployeeId(employeeId);
  await page.waitForLoadState('networkidle');

  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const count = await rows.count();
  if (count === 0) return; // already deleted

  // Use the row-level delete (trash) icon — the second button in each row's Actions cell.
  // Avoids the custom Vue checkbox overlay interception problem with bulk-select.
  const trashButton = rows.first().locator('.oxd-table-cell-actions button').last();
  await trashButton.click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// KAN-8: Update Employee Information
// ---------------------------------------------------------------------------
test.describe('KAN-8 — Update Employee Information', () => {
  test.setTimeout(120000);

  test('KAN-8-TC01: Update personal details persists on reload', async ({ page }) => {
    const employee = await createTestEmployee(page);
    const profilePage = new EmployeeProfilePage(page);

    // Update first name — form is always in edit mode
    const updatedFirst = `Updated${String(Date.now()).slice(-6)}`;
    await profilePage.editPersonalDetails({ firstName: updatedFirst });

    // Reload the profile and verify the saved value persisted
    await page.goto(employee.profileUrl);
    await page.waitForLoadState('networkidle');
    // Give the Vue app time to hydrate and populate the field values
    await page.waitForTimeout(1000);

    // Fields are always editable — read the current value directly
    await expect(profilePage.firstNameInput).toHaveValue(updatedFirst);

    // Cleanup — use employeeId (plain text search, reliable)
    await deleteFromList(page, employee.employeeId);
  });
});

// ---------------------------------------------------------------------------
// KAN-9: Delete Employee Record
// ---------------------------------------------------------------------------
test.describe('KAN-9 — Delete Employee Record', () => {
  test.setTimeout(120000);

  test('KAN-9-TC01: Delete action shows confirmation dialog', async ({ page }) => {
    const employee = await createTestEmployee(page);

    const listPage = new EmployeeListPage(page);
    await listPage.navigate();
    // Use Employee ID for reliable search
    await listPage.searchByEmployeeId(employee.employeeId);
    await page.waitForLoadState('networkidle');

    // Click the row-level trash button to trigger the delete confirmation dialog
    const rows = page.locator('.oxd-table-body .oxd-table-row');
    const trashButton = rows.first().locator('.oxd-table-cell-actions button').last();
    await trashButton.click();

    // Confirmation dialog must appear
    await expect(page.getByRole('button', { name: 'Yes, Delete' })).toBeVisible();

    // Cancel — keep the employee, clean up properly below
    await page.getByRole('button', { name: 'No, Cancel' }).click();

    // Cleanup
    await deleteFromList(page, employee.employeeId);
  });

  test('KAN-9-TC02: Confirm delete removes employee from list', async ({ page }) => {
    const employee = await createTestEmployee(page);

    await deleteFromList(page, employee.employeeId);

    // After deletion, verify the employee no longer appears in search by ID
    const listPage = new EmployeeListPage(page);
    await listPage.searchByEmployeeId(employee.employeeId);
    await expect(listPage.noRecordsText).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// KAN-10: Maintain Employee Documents
// ---------------------------------------------------------------------------
test.describe('KAN-10 — Maintain Employee Documents', () => {
  test.setTimeout(120000);

  test('KAN-10-TC01: Upload document attaches to employee profile', async ({ page }) => {
    const employee = await createTestEmployee(page);
    const profilePage = new EmployeeProfilePage(page);

    const sampleFile = path.join(
      __dirname,
      '../../../test_data/pim/sample-document.txt',
    );

    await profilePage.uploadDocument(sampleFile);

    // The uploaded file should appear in the attachments table
    await expect(profilePage.attachmentsTableBody).toBeVisible();
    const attachmentText = await profilePage.attachmentsTableBody.textContent();
    expect(attachmentText).toMatch(/sample-document/i);

    // Cleanup
    await deleteFromList(page, employee.employeeId);
  });
});
