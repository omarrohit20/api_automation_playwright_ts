// spec: spec/ui/pim/add-employee.spec.ts
// pattern: Page Object Model

import { test, expect } from '@playwright/test';
import { AddEmployeePage } from '../../../libs/pages/pim/AddEmployeePage';

test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe('PIM — Add Employee', () => {
  // TC-027: Add Employee form renders with expected fields and controls
  test('TC-027: navigate to Add Employee — form fields and Save button are visible', async ({
    page,
  }) => {
    const addEmployeePage = new AddEmployeePage(page);

    // Step 1: Navigate to the Add Employee page
    await addEmployeePage.navigate();

    // Step 2: First Name input is visible
    await expect(page.locator('input[name="firstName"]')).toBeVisible();

    // Step 3: Last Name input is visible
    await expect(page.locator('input[name="lastName"]')).toBeVisible();

    // Step 4: Employee ID input is visible (within the Employee Id label group)
    await expect(
      page.locator('.oxd-form .oxd-input-group:has(.oxd-label:text("Employee Id")) .oxd-input'),
    ).toBeVisible();

    // Step 5: Save button is visible
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  // TC-028: Submitting empty First/Last Name shows inline validation messages
  test('TC-028: click Save with empty First Name and Last Name — validation messages appear', async ({
    page,
  }) => {
    const addEmployeePage = new AddEmployeePage(page);

    // Step 1: Navigate to the Add Employee page
    await addEmployeePage.navigate();

    // Step 2: Clear both name fields (they may pre-populate)
    await addEmployeePage.clearFirstName();
    await addEmployeePage.clearLastName();

    // Step 3: Click Save
    await addEmployeePage.clickSave();

    // Step 4: Validation message under First Name contains "Required"
    const firstNameMsg = await addEmployeePage.getFirstNameValidationMessage();
    expect(firstNameMsg).toMatch(/required/i);

    // Step 5: Validation message under Last Name contains "Required"
    const lastNameMsg = await addEmployeePage.getLastNameValidationMessage();
    expect(lastNameMsg).toMatch(/required/i);
  });

  // TC-029: Filling valid First/Last Name and saving redirects to profile page
  test('TC-029: fill First Name "UIAutoFN" and Last Name "UIAutoLN" — Save redirects to employee profile', async ({
    page,
  }) => {
    const addEmployeePage = new AddEmployeePage(page);

    // Step 1: Navigate to the Add Employee page
    await addEmployeePage.navigate();

    // Step 2: Fill in First Name
    await addEmployeePage.fillFirstName('UIAutoFN');

    // Step 3: Fill in Last Name
    await addEmployeePage.fillLastName('UIAutoLN');

    // Step 4: Click Save
    await addEmployeePage.clickSave();

    // Step 5: URL transitions to the employee profile page
    await page.waitForURL('**/pim/viewPersonalDetails/empNumber/**');
    const onProfile = await addEmployeePage.isOnProfilePage();
    expect(onProfile).toBe(true);
  });
});
