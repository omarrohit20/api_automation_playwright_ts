# Script Changes — KAN-15 run-01

**Date:** 2026-07-15  
**Run:** run-01 (first run for this Epic)

---

## Files Created / Modified

| File | Action | Reason | Tags | Author |
|------|--------|--------|------|--------|
| `playwright.config.ts` | Modified (added `admin-ui` project) | New `spec/ui/admin/**/*.spec.ts` pattern requires its own Playwright project entry, mirroring `pim-ui` and `leave-ui` | N/A (config, not a test) | qa-analyst |
| `libs/admin-users.ts` | Created | New AdminUsers wrapper class for OrangeHRM `/api/v2/admin/users` endpoint — covers KAN-16 and KAN-17 API surface | N/A (wrapper, not a test) | api-automation-architect |
| `test_data/admin-users-list-response.json` | Created | Structural fixture template for the users list API response used in TC-KAN16-01 assertions | N/A (fixture) | api-automation-architect |
| `spec/api/admin-users.spec.ts` | Created | API test spec for KAN-15 (KAN-16 + KAN-17): 8 test cases covering list, pagination, auth rejection, and all search filters | @smoke @sanity @regression (TC-KAN16-01, TC-KAN16-03, TC-KAN17-01, TC-KAN17-04); @sanity @regression (TC-KAN16-02, TC-KAN17-02, TC-KAN17-03); @regression (TC-KAN17-05) | api-automation-architect |
| `libs/pages/admin/AdminUsersPage.ts` | Created | Page Object for Admin > User Management > Users page — navigate, waitForTable, search, reset, column header assertions, no-records check | N/A (page object, not a test) | ui-automation-architect |
| `spec/ui/admin/admin-users.spec.ts` | Created | UI test spec for KAN-15 (KAN-16 + KAN-17): 3 test cases covering column render, username/role search, and no-records message | @smoke @sanity @regression (TC-KAN16-04, TC-KAN17-06, TC-KAN17-07) | ui-automation-architect |

| `spec/ui/auth.setup.ts` | Modified (targeted defect fix) | Replaced `getByPlaceholder('Username')` with `waitForSelector('input[name="username"]')` + name-attribute selectors. Demo server was rendering in Chinese; placeholder "Username" didn't exist in that locale. Language-independent fix. | N/A (setup, not a test) | qa-analyst |
| `libs/pages/admin/AdminUsersPage.ts` | Modified (targeted defect fix x2) | (1) `searchByUsername`, `searchByRole`, `resetSearch`: replaced `waitForLoadState('networkidle')` with `waitForResponse('**/api/v2/admin/users**')` to avoid race condition where networkidle resolved before the search XHR started. (2) `navigate()`: added waitForResponse to ensure initial data load completes. (3) `isNoRecordsMessageVisible()`: scoped `getByText('No Records Found')` to `span.oxd-text` to resolve strict mode violation from toast notification. | N/A (page object, not a test) | qa-analyst |

---

## Notes

- `playwright.config.ts` was updated by `qa-analyst` (config file, not a spec/wrapper/page-object).
- The `admin-ui` project depends on `auth-setup` (same as `pim-ui` and `leave-ui`) and matches `spec/ui/admin/**/*.spec.ts`.
- The `AdminUsers` wrapper class follows the exact pattern of `libs/leave.ts` (cookies-based auth, `sendGetRequest` via `libs/utils/requests.ts`).
- The `AdminUsersPage.ts` follows the exact pattern of `libs/pages/pim/EmployeeListPage.ts`.
- No seed scripts are needed for this Epic — the demo app ships with users and no create/update/delete operations are tested.
