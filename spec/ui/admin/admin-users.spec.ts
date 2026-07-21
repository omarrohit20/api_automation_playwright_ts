// spec: spec/ui/admin/admin-users.spec.ts
// pattern: Page Object Model

import { test, expect } from '@playwright/test';
import { AdminUsersPage } from '../../../libs/pages/admin/AdminUsersPage';

test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe('Admin Users UI — KAN-15', () => {
  test.describe('KAN-16: View System Users', () => {
    test(
      'TC-KAN16-04: navigate to User Management Users page — all four AC column headers are visible',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async ({ page }) => {
        const adminUsersPage = new AdminUsersPage(page);

        // Step 1: Navigate to the Admin Users page
        await adminUsersPage.navigate();

        // Step 2: Wait for the table header to be visible
        await adminUsersPage.waitForTable();

        // Step 3: Get column headers and assert required columns are present
        const headers = await adminUsersPage.getColumnHeaders();
        expect(headers).toContain('Username');
        expect(headers).toContain('User Role');
        expect(headers).toContain('Employee Name');
        expect(headers).toContain('Status');
      },
    );
  });

  test.describe('KAN-17: Search System Users', () => {
    test(
      'TC-KAN17-06: search by Username "Admin" — matching rows appear; search by Role "ESS" — ESS rows appear',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async ({ page }) => {
        const adminUsersPage = new AdminUsersPage(page);

        // Step 1: Navigate to the Admin Users page
        await adminUsersPage.navigate();

        // Step 2: Search by username "Admin"
        await adminUsersPage.searchByUsername('Admin');

        // Step 3: Assert at least one row is returned
        const rowCountAfterUsernameSearch = await adminUsersPage.getTableRowCount();
        expect(rowCountAfterUsernameSearch).toBeGreaterThan(0);

        // Step 4: Assert every returned username contains "Admin" (case-insensitive)
        const usernameValues = await adminUsersPage.getUsernameColumnValues();
        for (const username of usernameValues) {
          expect(username.toLowerCase()).toContain('admin');
        }

        // Step 5: Reset the search form
        await adminUsersPage.resetSearch();

        // Step 6: Search by role "ESS"
        await adminUsersPage.searchByRole('ESS');

        // Step 7: Assert every returned role equals "ESS"
        const roleValues = await adminUsersPage.getRoleColumnValues();
        for (const role of roleValues) {
          expect(role).toBe('ESS');
        }
      },
    );

    test(
      'TC-KAN17-07: search with non-existent username — "No Records Found" message is displayed',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async ({ page }) => {
        const adminUsersPage = new AdminUsersPage(page);

        // Step 1: Navigate to the Admin Users page
        await adminUsersPage.navigate();

        // Step 2: Search for a username that does not exist
        await adminUsersPage.searchByUsername('zzz_nonexistent_user_xyz');

        // Step 3: Assert the "No Records Found" message is visible
        const noRecords = await adminUsersPage.isNoRecordsMessageVisible();
        expect(noRecords).toBe(true);

        // Step 4: Assert the table body has zero rows
        const rowCount = await adminUsersPage.getTableRowCount();
        expect(rowCount).toBe(0);
      },
    );
  });
});
