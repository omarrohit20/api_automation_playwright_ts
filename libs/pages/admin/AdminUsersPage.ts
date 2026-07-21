import { type Locator, type Page } from '@playwright/test';

export class AdminUsersPage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    // Navigate and wait for both the table header DOM element and the initial users API response.
    const responsePromise = this.page.waitForResponse('**/api/v2/admin/users**', { timeout: 30000 });
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
    await responsePromise;
  }

  async waitForTable(): Promise<void> {
    await this.page.waitForSelector('.oxd-table-header', { timeout: 15000 });
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.page.locator('.oxd-table-header .oxd-table-header-cell');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).innerText();
      texts.push(text.trim());
    }
    return texts;
  }

  async searchByUsername(username: string): Promise<void> {
    await this.page
      .locator('.oxd-form .oxd-input-group:has(.oxd-label:text("Username")) .oxd-input')
      .fill(username);
    // Use waitForResponse before the click to race correctly with the XHR call.
    // waitForLoadState('networkidle') is unreliable here because the page may already be idle
    // by the time the promise is set up, causing it to return before the search XHR fires.
    const responsePromise = this.page.waitForResponse('**/api/v2/admin/users**', { timeout: 30000 });
    await this.page.getByRole('button', { name: 'Search' }).click();
    await responsePromise;
  }

  async searchByRole(role: 'Admin' | 'ESS'): Promise<void> {
    await this.page
      .locator('.oxd-form .oxd-input-group:has(.oxd-label:text("User Role")) .oxd-select-text')
      .click();
    await this.page.locator(`.oxd-select-dropdown span:text("${role}")`).click();
    const responsePromise = this.page.waitForResponse('**/api/v2/admin/users**', { timeout: 30000 });
    await this.page.getByRole('button', { name: 'Search' }).click();
    await responsePromise;
  }

  async resetSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse('**/api/v2/admin/users**', { timeout: 30000 });
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await responsePromise;
  }

  async getTableRowCount(): Promise<number> {
    return this.getTableRows().count();
  }

  async isNoRecordsMessageVisible(): Promise<boolean> {
    // Target the table-area "No Records Found" span specifically, not the toast notification
    // which also renders "No Records Found" and causes a strict mode violation.
    return this.page.locator('span.oxd-text').filter({ hasText: 'No Records Found' }).isVisible();
  }

  getTableRows(): Locator {
    return this.page.locator('.oxd-table-body .oxd-table-row');
  }

  async getUsernameColumnValues(): Promise<string[]> {
    const rows = this.getTableRows();
    const count = await rows.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      // Index 0 is the checkbox cell; index 1 is the Username cell.
      const cell = rows.nth(i).locator('.oxd-table-cell').nth(1);
      const text = await cell.innerText();
      values.push(text.trim());
    }
    return values;
  }

  async getRoleColumnValues(): Promise<string[]> {
    const rows = this.getTableRows();
    const count = await rows.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      // Index 0 is the checkbox cell; index 2 is the User Role cell.
      const cell = rows.nth(i).locator('.oxd-table-cell').nth(2);
      const text = await cell.innerText();
      values.push(text.trim());
    }
    return values;
  }
}
