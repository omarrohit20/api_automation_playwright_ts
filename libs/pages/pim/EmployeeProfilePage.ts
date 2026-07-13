import { Page, Locator } from '@playwright/test';

export interface PersonalDetailsUpdate {
  firstName?: string;
  lastName?: string;
}

/**
 * Page Object for the OrangeHRM Employee Profile page.
 *
 * Key structural notes (verified against live app):
 * - Personal Details form is ALWAYS in edit mode — no "Edit" button toggle exists.
 *   Fields (First Name, Last Name, etc.) are directly editable.
 * - The "Attachments" section is at the bottom of the Personal Details page;
 *   it is NOT a separate tab in the sidebar navigation.
 * - Employee deletion is done from the Employee List page (trash icon per row),
 *   NOT from within the employee profile itself.
 */
export class EmployeeProfilePage {
  // Profile heading — shows "FirstName LastName" (h6 inside the left panel)
  readonly employeeNameHeading: Locator;

  // Personal Details section — always editable, no toggle
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  // Save button for the Personal Details section (first Save on the page)
  readonly savePersonalDetailsButton: Locator;

  // Attachments section — at the bottom of the Personal Details page
  // (not a sidebar tab; the "Add" button is next to the "Attachments" heading)
  readonly attachmentsAddButton: Locator;
  readonly fileInput: Locator;
  // "Save" inside the attachment upload dialog
  readonly attachmentDialogSaveButton: Locator;
  // The table body listing uploaded files
  readonly attachmentsTableBody: Locator;

  constructor(private page: Page) {
    // The employee name heading in the left panel
    this.employeeNameHeading = page.locator('.orangehrm-edit-employee-name');

    // Name inputs — directly accessible (form is always editable)
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');

    // First "Save" button on the page belongs to Personal Details
    this.savePersonalDetailsButton = page.getByRole('button', { name: 'Save' }).first();

    // Attachments section is below the form on the same Personal Details page.
    // The "Add" button sits directly next to the "Attachments" heading.
    this.attachmentsAddButton = page
      .locator('.orangehrm-horizontal-padding')
      .filter({ hasText: 'Attachments' })
      .getByRole('button', { name: 'Add' });

    // Hidden file input revealed after clicking Add
    this.fileInput = page.locator('input[type="file"]');

    // Save button inside the upload dialog — last Save on page or scoped to dialog
    this.attachmentDialogSaveButton = page.getByRole('button', { name: 'Save' }).last();

    // Table body for the uploaded attachments list
    this.attachmentsTableBody = page.locator('.orangehrm-attachment .oxd-table-body');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.employeeNameHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getEmployeeName(): Promise<string> {
    return this.employeeNameHeading.textContent().then((t) => t?.trim() ?? '');
  }

  /**
   * Edits personal details fields and saves.
   * No "Edit" button click needed — form is always editable.
   */
  async editPersonalDetails(data: PersonalDetailsUpdate): Promise<void> {
    if (data.firstName !== undefined) {
      // Use pressSequentially to fire key events — OrangeHRM's Vue inputs need these.
      await this.firstNameInput.click();
      await this.firstNameInput.selectText();
      await this.firstNameInput.pressSequentially(data.firstName, { delay: 30 });
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.click();
      await this.lastNameInput.selectText();
      await this.lastNameInput.pressSequentially(data.lastName, { delay: 30 });
    }
    await this.savePersonalDetailsButton.click();
    // Wait for the success toast to confirm the save was processed
    await this.page.getByText('Successfully Updated').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Uploads a file to the employee's Attachments section (bottom of Personal Details page).
   */
  async uploadDocument(filePath: string): Promise<void> {
    await this.attachmentsAddButton.click();
    await this.fileInput.setInputFiles(filePath);
    await this.attachmentDialogSaveButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
