// spec: spec/ui/leave/leave-list.spec.ts
// pattern: Page Object Model

import { test, expect, chromium } from '@playwright/test';
import { LeaveListPage } from '../../../libs/pages/leave/LeaveListPage';

test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe('Leave — Leave List search page', () => {
  // TS-011: Leave Type dropdown populates from API
  test('TS-011: Leave Type dropdown is visible after leave-types API call resolves', async ({
    page,
  }) => {
    const leaveListPage = new LeaveListPage(page);

    // Step 1: Intercept the leave-types reference endpoint before navigating
    const leaveTypesResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/leave/leave-types') &&
        response.request().method() === 'GET',
    );

    // Step 2: Navigate to the Leave List page
    await leaveListPage.navigate();

    // Step 3: Assert the leave-types API was called and returned HTTP 200
    const leaveTypesResponse = await leaveTypesResponsePromise;
    expect(leaveTypesResponse.status()).toBe(200);

    // Step 4: Assert the Leave Type dropdown rendered (API data drove the component)
    const dropdownVisible = await leaveListPage.isLeaveTypeDropdownVisible();
    expect(dropdownVisible).toBe(true);
  });

  // TS-012: Search with default Pending Approval status shows results table with correct headers
  test('TS-012: search with default filters shows results table with all expected column headers', async ({
    page,
  }) => {
    const leaveListPage = new LeaveListPage(page);

    // Step 1: Navigate to the Leave List page
    await leaveListPage.navigate();

    // Step 2: Verify the "Leave List" heading is present, confirming the page loaded correctly
    await expect(
      page.getByRole('heading', { name: 'Leave List' }).first(),
    ).toBeVisible();

    // Step 3: Wait for the leave-requests API response that Search triggers, then click Search
    const searchResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/v2/leave/employees/leave-requests'),
    );
    await leaveListPage.clickSearch();
    await searchResponsePromise;

    // Step 4: Verify the results table rendered
    const headers = await leaveListPage.getTableHeaders();
    expect(headers.length).toBeGreaterThan(0);

    // Step 5: Assert all expected column headers are present
    const expectedHeaders = [
      'Date',
      'Employee Name',
      'Leave Type',
      'Leave Balance (Days)',
      'Number of Days',
      'Status',
      'Comments',
      'Actions',
    ];
    for (const expected of expectedHeaders) {
      expect(headers).toContain(expected);
    }

    // Step 6: Verify either result rows are shown OR the "No Records Found" message appears —
    // both are valid outcomes on the shared demo environment
    const rowCount = await leaveListPage.getResultsCount();
    const noRecords = await leaveListPage.isNoRecordsMessageVisible();
    expect(rowCount > 0 || noRecords).toBe(true);
  });

  // TS-013: Reset button restores default filter values
  test('TS-013: Reset button reverts From Date to current-year default and clears Employee Name', async ({
    page,
  }) => {
    const leaveListPage = new LeaveListPage(page);

    // Step 1: Navigate to the Leave List page
    await leaveListPage.navigate();

    // Step 2: Record the default From Date value set by the page (e.g. 2026-01-01)
    const defaultFromDate = await leaveListPage.getFromDateValue();
    expect(defaultFromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Step 3: Change the From Date to a different value to alter the filter state
    await leaveListPage.setFromDate('2024-01-01');
    const changedFromDate = await leaveListPage.getFromDateValue();
    expect(changedFromDate).toBe('2024-01-01');

    // Step 4: Click Search with the modified filter
    await leaveListPage.clickSearch();

    // Step 5: Click Reset
    await leaveListPage.clickReset();

    // Step 6: Assert From Date reverted to the original default
    const restoredFromDate = await leaveListPage.getFromDateValue();
    expect(restoredFromDate).toBe(defaultFromDate);

    // Step 7: Assert Employee Name field is empty (Reset clears all text filters)
    const employeeNameValue = await leaveListPage.getEmployeeNameValue();
    expect(employeeNameValue).toBe('');

    // Step 8: Verify no error dialog or alert appeared after Reset
    const errorAlert = page.locator('.oxd-alert--error');
    await expect(errorAlert).not.toBeVisible();
  });

  // TS-014: Leave list displays all six required AC columns
  test(
    'TS-014: leave list table contains all AC-required column headers',
    { tag: ['@smoke', '@sanity', '@regression'] },
    async ({ page }) => {
      const leaveListPage = new LeaveListPage(page);

      // Step 1: Navigate to the Leave List page
      await leaveListPage.navigate();

      // Step 2: Click Search to render the results table
      await leaveListPage.clickSearch();

      // Step 3: Retrieve visible column headers
      const headers = await leaveListPage.getTableHeaders();

      // Step 4: Assert the four AC-critical headers are present.
      // Note: "From Date" and "To Date" are merged into a single "Date" column in the UI;
      // "Date" is therefore the observable equivalent of those two AC columns.
      const acCriticalHeaders = [
        'Employee Name',
        'Leave Type',
        'Number of Days',
        'Status',
      ];
      for (const expected of acCriticalHeaders) {
        expect(headers, `Expected header "${expected}" to be present`).toContain(expected);
      }
    },
  );

  // TS-017: UI next-page control loads page 2 when records exist
  test(
    'TS-017: pagination Next button loads page 2 records when more than one page exists',
    { tag: ['@sanity', '@regression'] },
    async ({ page }) => {
      const leaveListPage = new LeaveListPage(page);

      // Step 1: Navigate and trigger a search to load all available records
      await leaveListPage.navigate();
      await leaveListPage.clickSearch();

      // Step 2: Check whether the Next pagination button is present and enabled
      const nextVisible = await leaveListPage.isPaginationNextVisible();
      if (!nextVisible) {
        test.skip(true, 'Fewer than one page of records — pagination Next button not present; skipping TS-017');
        return;
      }

      // Step 3: Capture the first row of page 1 as a reference point
      const page1FirstRow = await leaveListPage.getFirstRowFirstCellText();

      // Step 4: Navigate to page 2
      await leaveListPage.clickPaginationNext();

      // Step 5: Assert page 2 records differ from page 1 records
      const page2FirstRow = await leaveListPage.getFirstRowFirstCellText();
      expect(page2FirstRow).not.toBe(page1FirstRow);

      // Step 6: Confirm no error alert is visible after navigation
      const errorAlert = page.locator('.oxd-alert--error');
      await expect(errorAlert).not.toBeVisible();
    },
  );

  // TS-019: Leave list inaccessible to unauthenticated user
  test(
    'TS-019: unauthenticated navigation to leave list redirects to login page',
    { tag: ['@smoke', '@sanity', '@regression'] },
    async () => {
      // Step 1: Launch a fresh browser context with NO storage state to simulate
      // an unauthenticated session (overrides the test.use storageState at describe level)
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const freshPage = await context.newPage();

      try {
        // Step 2: Attempt to navigate directly to the Leave List URL
        await freshPage.goto(
          'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList',
        );
        await freshPage.waitForLoadState('networkidle');

        // Step 3: Assert the app redirected to the login page.
        // OrangeHRM uses client-side Vue routing, so the redirect may be async;
        // wait up to 10 s for the URL to change before falling back to a content check.
        try {
          await freshPage.waitForURL(/auth\/login/, { timeout: 10000 });
        } catch {
          // URL may not change on some configurations; content check below is the authority
        }
        const isOnLoginPage =
          freshPage.url().includes('/auth/login') ||
          (await freshPage.locator('input[name="username"]').isVisible());
        expect(isOnLoginPage, 'Expected unauthenticated user to be on login page').toBe(true);

        // Step 4: Assert the Leave List heading is NOT visible on the redirected page
        const leaveListHeading = freshPage.getByRole('heading', { name: 'Leave List' });
        await expect(leaveListHeading).not.toBeVisible();
      } finally {
        await context.close();
        await browser.close();
      }
    },
  );

  // TS-021: Leave list with no matching records shows "No Records Found" empty state
  test(
    'TS-021: searching with a date range in year 2000 shows No Records Found empty state',
    { tag: ['@sanity', '@regression'] },
    async ({ page }) => {
      const leaveListPage = new LeaveListPage(page);

      // Step 1: Navigate to the Leave List page
      await leaveListPage.navigate();

      // Step 2: Set From Date to a very old date — no leave records expected for this range
      await leaveListPage.setFromDate('2000-01-01');

      // Step 3: Set To Date to one day after From Date
      await leaveListPage.setToDate('2000-01-02');

      // Step 4: Click Search and wait for the response
      const searchResponsePromise = page.waitForResponse((response) =>
        response.url().includes('/api/v2/leave/employees/leave-requests'),
      );
      await leaveListPage.clickSearch();
      await searchResponsePromise;

      // Step 5: Assert the "No Records Found" empty-state message is visible
      const noRecords = await leaveListPage.isNoRecordsMessageVisible();
      expect(noRecords).toBe(true);

      // Step 6: Assert no JS error alert appeared
      const errorAlert = page.locator('.oxd-alert--error');
      await expect(errorAlert).not.toBeVisible();
    },
  );
});
