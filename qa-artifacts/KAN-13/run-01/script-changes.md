# Script Changes — KAN-13 run-01
**Date:** 2026-07-14

| File | Change Type | Reason | Author |
|------|-------------|--------|--------|
| `libs/leave.ts` | Created | New Leave API wrapper class covering `/api/v2/leave/employees/leave-requests`, `/leave/leave-types`, `/leave/leave-periods`, `/leave/holidays` endpoints discovered in network capture | api-automation-architect |
| `spec/api/leave-search.spec.ts` | Created | 10 API test cases (TS-001–TS-010) covering KAN-13 ACs: happy path search, leave-types/leave-periods reference data, negative (reversed dates), and boundary (leap year) | api-automation-architect |
| `libs/pages/leave/LeaveListPage.ts` | Created | Page Object for Leave List page — navigate(), clickSearch(), clickReset(), getTableHeaders(), isNoRecordsMessageVisible(), selectLeaveStatus(), selectLeaveType(), getFromDateValue(), setFromDate(), setToDate() | ui-automation-architect |
| `spec/ui/leave/leave-list.spec.ts` | Created | 3 UI test cases (TS-011–TS-013) covering Leave Type dropdown population, search results table, and Reset button behavior | ui-automation-architect |
| `playwright.config.ts` | Modified | Added `leave-ui` project definition targeting `spec/ui/leave/**/*.spec.ts` with auth dependency and correct baseURL | ui-automation-architect |

## Deviation Notes
- **TS-008** (`empNumber=999999`): OrangeHRM returns HTTP 422 for non-existent empNumber (same behavior documented in pim-employees.spec.ts). Test accepts 200 (empty data) OR 400/422 to handle both cases.
- **TS-013** (Reset): Default From Date captured dynamically at runtime rather than hardcoded to `2026-01-01` — stays green if the demo site's leave period year changes.
- **getTableHeaders()**: Uses `getByRole('columnheader')` for the native `<table>` element on the Leave List page. If the table is rendered as OXD div-rows instead, the selector needs to change to `.oxd-table-header .oxd-table-header-cell` (same as EmployeeListPage).
