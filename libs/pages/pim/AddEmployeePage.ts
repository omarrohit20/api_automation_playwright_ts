import { type Page } from '@playwright/test';

export class AddEmployeePage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee');
  }

  async fillFirstName(name: string): Promise<void> {
    await this.page.locator('input[name="firstName"]').fill(name);
  }

  async fillLastName(name: string): Promise<void> {
    await this.page.locator('input[name="lastName"]').fill(name);
  }

  async fillEmployeeId(id: string): Promise<void> {
    // Employee ID field is the last text input in the top section
    const idInput = this.page.locator(
      '.oxd-form .oxd-input-group:has(.oxd-label:text("Employee Id")) .oxd-input',
    );
    await idInput.clear();
    await idInput.fill(id);
  }

  async clearFirstName(): Promise<void> {
    await this.page.locator('input[name="firstName"]').clear();
  }

  async clearLastName(): Promise<void> {
    await this.page.locator('input[name="lastName"]').clear();
  }

  async clickSave(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async getFirstNameValidationMessage(): Promise<string> {
    // After validation fires, error messages appear in .oxd-input-field-error-message spans.
    // Use .first() since there may be multiple error spans visible at once (firstName + lastName).
    const msg = this.page
      .locator('input[name="firstName"]')
      .locator('xpath=ancestor::div[contains(@class,"oxd-input-group")]')
      .locator('.oxd-input-field-error-message')
      .first();
    return (await msg.innerText()).trim();
  }

  async getLastNameValidationMessage(): Promise<string> {
    const msg = this.page
      .locator('input[name="lastName"]')
      .locator('xpath=ancestor::div[contains(@class,"oxd-input-group")]')
      .locator('.oxd-input-field-error-message')
      .first();
    return (await msg.innerText()).trim();
  }

  async isOnProfilePage(): Promise<boolean> {
    return this.page.url().includes('/pim/viewPersonalDetails/empNumber/');
  }
}
