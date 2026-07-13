import { Page, Locator } from '@playwright/test';

export interface NewEmployeeData {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
}

export class AddEmployeePage {
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly createLoginDetailsToggle: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(private page: Page) {
    // OrangeHRM's Add Employee form uses name attributes on the inputs inside
    // a "Name" section.  The placeholder text is the most stable public signal.
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');

    // Employee ID sits below the Name section in its own input group
    this.employeeIdInput = page
      .locator('.oxd-input-group', { hasText: 'Employee Id' })
      .getByRole('textbox');

    this.createLoginDetailsToggle = page.locator('.oxd-switch-input');

    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee');
    await this.page.waitForLoadState('networkidle');
  }

  async fillMandatoryFields(
    firstName: string,
    lastName: string,
    employeeId: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    // Clear the auto-generated ID then type the desired one
    await this.employeeIdInput.clear();
    await this.employeeIdInput.fill(employeeId);
  }

  async fillAllFields(data: NewEmployeeData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    if (data.middleName) {
      await this.middleNameInput.fill(data.middleName);
    }
    await this.lastNameInput.fill(data.lastName);
    await this.employeeIdInput.clear();
    await this.employeeIdInput.fill(data.employeeId);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    // After save, OrangeHRM redirects to the employee's profile page
    await this.page.waitForURL('**/pim/viewPersonalDetails/empNumber/**');
  }

  async getEmployeeIdValue(): Promise<string> {
    return this.employeeIdInput.inputValue();
  }
}
