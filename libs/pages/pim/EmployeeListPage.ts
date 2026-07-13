import { Page, Locator } from '@playwright/test';

export class EmployeeListPage {
  // Search form
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  // Table / results
  readonly addButton: Locator;
  readonly tableRows: Locator;
  readonly noRecordsText: Locator;

  // Pagination
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  constructor(private page: Page) {
    // OrangeHRM uses Vue.js with oxd- prefixed components; labels are the most
    // stable anchors; fall back to placeholder text where labels are absent.
    this.employeeNameInput = page
      .locator('.oxd-input-group', { hasText: 'Employee Name' })
      .getByRole('textbox');

    this.employeeIdInput = page
      .locator('.oxd-input-group', { hasText: 'Employee Id' })
      .getByRole('textbox');

    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.addButton = page.getByRole('button', { name: 'Add' });

    // The data grid renders rows inside a div with role="row" under the main
    // table container; skip the header row by filtering on cells that look like
    // data (they have role="cell").
    this.tableRows = page.locator('.oxd-table-body .oxd-table-row');

    // "No Records Found" shows in a span.oxd-text--span (table area) vs a p.oxd-text--p (toast).
    // Target the span element specifically to avoid the disappearing toast notification.
    this.noRecordsText = page.locator('span.oxd-text--span').filter({ hasText: 'No Records Found' });

    // OrangeHRM pagination sits inside a nav[aria-label="Pagination Navigation"]
    const paginationNav = page.getByRole('navigation', { name: 'Pagination Navigation' });
    this.previousPageButton = paginationNav.getByRole('button').first();
    this.nextPageButton = paginationNav.getByRole('button').last();
  }

  async navigate(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await this.page.waitForLoadState('networkidle');
  }

  async searchByName(name: string): Promise<void> {
    // OrangeHRM's Employee Name field is a Vue autocomplete — use pressSequentially
    // to fire keydown/keyup events that the Vue component requires.
    await this.employeeNameInput.clear();
    await this.employeeNameInput.pressSequentially(name, { delay: 50 });
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchByEmployeeId(empId: string): Promise<void> {
    // Employee ID is a plain text input — fill() is fine here.
    await this.employeeIdInput.fill(empId);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchWithFilters(filters: {
    name?: string;
    employeeId?: string;
    status?: string;
  }): Promise<void> {
    if (filters.name) {
      await this.employeeNameInput.fill(filters.name);
    }
    if (filters.employeeId) {
      await this.employeeIdInput.fill(filters.employeeId);
    }
    if (filters.status) {
      // Employment Status is a custom Vue dropdown — click to open, then pick option
      const statusDropdown = this.page
        .locator('.oxd-input-group', { hasText: 'Employment Status' })
        .locator('.oxd-select-text');
      await statusDropdown.click();
      await this.page.getByRole('option', { name: filters.status }).click();
    }
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
    await this.page.waitForURL('**/pim/addEmployee**');
  }

  async getEmployeeRows(): Promise<Locator[]> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.tableRows.all();
  }

  async isNoRecordsFound(): Promise<boolean> {
    return this.noRecordsText.isVisible();
  }

  async deleteEmployeeByName(name: string): Promise<void> {
    // Find the row whose text includes the employee name and check its checkbox
    const row = this.tableRows.filter({ hasText: name }).first();
    await row.locator('input[type="checkbox"]').check();

    // The delete icon appears in the table header actions area once rows are selected
    await this.page.locator('button.oxd-icon-button.oxd-table-header-bulk-action-btn').click();

    // Confirm the dialog
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
