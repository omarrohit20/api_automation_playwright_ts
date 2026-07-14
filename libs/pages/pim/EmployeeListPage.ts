import { type Locator, type Page } from '@playwright/test';

export class EmployeeListPage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  async searchByName(name: string): Promise<void> {
    // The Employee Name field is the first "Type for hints..." input on the page
    await this.page.getByPlaceholder('Type for hints...').first().fill(name);
    await this.page.getByRole('button', { name: 'Search' }).click();
    // Wait for the table to settle after search
    await this.page.waitForLoadState('networkidle');
  }

  getTableRows(): Locator {
    return this.page.locator('.oxd-table-body .oxd-table-row');
  }

  async getRowCount(): Promise<number> {
    return this.getTableRows().count();
  }

  async isTableVisible(): Promise<boolean> {
    // OrangeHRM renders the employee list inside a card with .orangehrm-container class.
    // Wait briefly for the table to render after navigation, then check for table rows.
    try {
      await this.page.waitForSelector('.oxd-table-body', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
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
}
