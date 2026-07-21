import { type Locator, type Page } from '@playwright/test';

export interface LeaveSearchFilters {
  fromDate?: string;
  toDate?: string;
  leaveStatus?: string;
  leaveType?: string;
  employeeName?: string;
}

export class LeaveListPage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList');
    // Wait for the filter panel to render and date fields to populate
    await this.page.waitForSelector('.oxd-select-text', { timeout: 15000 });
    // Date fields are populated by Vue after mount; wait for the first one to have a value.
    // Wrapped in try/catch: on slow demo-env connections the field may not populate within
    // the timeout window, but the page is still usable for header/search assertions.
    try {
      await this.page.waitForFunction(
        () => {
          const inputs = document.querySelectorAll<HTMLInputElement>('input[placeholder="yyyy-mm-dd"]');
          return inputs.length > 0 && inputs[0].value !== '';
        },
        { timeout: 15000 }
      );
    } catch {
      // Acceptable on slow connections — continue; date fields may still be empty
    }
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async clickSearch(): Promise<void> {
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickReset(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Selects a value from the "Show Leave with Status" custom Vue oxd-select dropdown.
   * The dropdown is identified by the label text "Show Leave with Status".
   */
  async selectLeaveStatus(value: string): Promise<void> {
    const group = this.page.locator(
      '.oxd-input-group:has(.oxd-label:text("Show Leave with Status"))',
    );
    await group.locator('.oxd-select-text').click();
    await this.page
      .locator('.oxd-select-dropdown .oxd-select-option')
      .filter({ hasText: value })
      .first()
      .click();
  }

  /**
   * Selects a value from the "Leave Type" custom Vue oxd-select dropdown.
   */
  async selectLeaveType(value: string): Promise<void> {
    const group = this.page.locator(
      '.oxd-input-group:has(.oxd-label:text("Leave Type"))',
    );
    await group.locator('.oxd-select-text').click();
    await this.page
      .locator('.oxd-select-dropdown .oxd-select-option')
      .filter({ hasText: value })
      .first()
      .click();
  }

  /**
   * Fills the From Date field (first yyyy-mm-dd input on the page).
   * Uses triple-click to select existing text before typing so the field
   * replaces the default value rather than appending.
   */
  async setFromDate(date: string): Promise<void> {
    const field = this.page.getByPlaceholder('yyyy-mm-dd').first();
    await field.click({ clickCount: 3 });
    await field.fill(date);
    // Blur to commit the value without opening the date-picker popup
    await field.press('Tab');
  }

  /**
   * Fills the To Date field (second yyyy-mm-dd input on the page).
   */
  async setToDate(date: string): Promise<void> {
    const field = this.page.getByPlaceholder('yyyy-mm-dd').nth(1);
    await field.click({ clickCount: 3 });
    await field.fill(date);
    await field.press('Tab');
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  async getFromDateValue(): Promise<string> {
    return this.page.getByPlaceholder('yyyy-mm-dd').first().inputValue();
  }

  async getToDateValue(): Promise<string> {
    return this.page.getByPlaceholder('yyyy-mm-dd').nth(1).inputValue();
  }

  async getEmployeeNameValue(): Promise<string> {
    return this.page.getByPlaceholder('Type for hints...').first().inputValue();
  }

  /**
   * Returns the visible column header texts from the results table.
   * OrangeHRM Leave List renders headers as role="columnheader" cells.
   */
  async getTableHeaders(): Promise<string[]> {
    const headers = this.page.getByRole('columnheader');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).innerText();
      const trimmed = text.trim();
      if (trimmed) {
        texts.push(trimmed);
      }
    }
    return texts;
  }

  /**
   * Returns the number of data rows currently rendered in the results table.
   * The Leave List page uses a native <table> element (not OXD div-based).
   */
  async getResultsCount(): Promise<number> {
    return this.getTableRows().count();
  }

  getTableRows(): Locator {
    // Native <table> tbody rows
    return this.page.locator('table tbody tr');
  }

  /**
   * Returns true if the "No Records Found" message is visible anywhere in the results area.
   * The message is rendered outside the <table> element on the Leave List page.
   */
  async isNoRecordsMessageVisible(): Promise<boolean> {
    // Scope to the span element in the results area (not toast notifications)
    const msg = this.page.locator('span.oxd-text--span', { hasText: 'No Records Found' }).first();
    return msg.isVisible();
  }

  /**
   * Returns true if the pagination "Next" button is present and enabled.
   * Used by TS-017 to decide whether to attempt page-2 navigation.
   */
  async isPaginationNextVisible(): Promise<boolean> {
    const next = this.page
      .locator('.oxd-pagination-page-item--next button')
      .or(this.page.getByRole('button', { name: 'Next' }))
      .first();
    try {
      await next.waitFor({ timeout: 3000 });
    } catch {
      return false;
    }
    return next.isVisible();
  }

  /**
   * Clicks the pagination "Next" button to advance to page 2.
   */
  async clickPaginationNext(): Promise<void> {
    const next = this.page
      .locator('.oxd-pagination-page-item--next button')
      .or(this.page.getByRole('button', { name: 'Next' }))
      .first();
    await next.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Returns the text content of the first data row's first cell,
   * used to detect that page 2 has different records than page 1.
   */
  async getFirstRowFirstCellText(): Promise<string> {
    const cell = this.page.locator('table tbody tr').first().locator('td').first();
    return cell.innerText();
  }

  /**
   * Returns true if the Leave Type dropdown container is present in the DOM,
   * indicating the filter panel has rendered (used to assert the dropdown loaded).
   */
  async isLeaveTypeDropdownVisible(): Promise<boolean> {
    try {
      const group = this.page.locator(
        '.oxd-input-group:has(.oxd-label:text("Leave Type"))',
      );
      await group.waitFor({ timeout: 8000 });
      return group.locator('.oxd-select-text').isVisible();
    } catch {
      return false;
    }
  }
}
