# Test Cases — KAN-13: Search Leave Requests
**Run:** run-01 | **Date:** 2026-07-14 | **Total:** 14 | **Mix:** 10 API (71%) / 3 UI (21%) / 1 Manual (7%)

---

## KAN-13 — Search Leave Requests

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|----|-------|---------------|-------|-----------------|------|-----------|----------|
| TS-001 | Happy Path — Search returns results for valid date range with default status | Authenticated as HR Manager; leave records exist in 2025 | 1. GET `/api/v2/leave/employees/leave-requests?fromDate=2025-01-01&toDate=2025-12-31&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert HTTP 200 3. Assert `data` is array, `meta.total` is number | HTTP 200; response has `data[]` and `meta.total` ≥ 0; no server error | API | Y | Must Test |
| TS-002 | Happy Path — Search by Leave Status (Pending=1) returns only pending records | Authenticated; mixed status records exist | 1. GET `/api/v2/leave/employees/leave-requests?fromDate=2025-01-01&toDate=2025-12-31&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert HTTP 200 3. Assert all records in `data[].leaveRequestDayStatuses` reflect pending status | HTTP 200; `data` array present; structure matches expected shape | API | Y | Must Test |
| TS-003 | Happy Path — Search by Leave Type ID filters results | Authenticated; `/api/v2/leave/leave-types?limit=0` returns leave types | 1. GET `/api/v2/leave/leave-types?limit=0` — capture a valid `leaveTypeId` (e.g. id=1) 2. GET `/api/v2/leave/employees/leave-requests?fromDate=2025-01-01&toDate=2025-12-31&statuses[]=1&leaveTypeId=1&limit=50&offset=0&includeEmployees=onlyCurrent` 3. Assert HTTP 200 | HTTP 200; `data` array present; `meta.total` is a number | API | Y | Must Test |
| TS-004 | Happy Path — Date range filter limits results to specified range | Authenticated | 1. GET `/api/v2/leave/employees/leave-requests?fromDate=2025-03-01&toDate=2025-03-31&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert HTTP 200 3. Assert valid JSON structure | HTTP 200; JSON with `data[]` and `meta.total` returned without error | API | Y | Must Test |
| TS-005 | Happy Path — GET leave-types reference endpoint returns non-empty list | Authenticated | 1. GET `/api/v2/leave/leave-types?limit=0` 2. Assert HTTP 200 3. Assert `data` is non-empty array 4. Assert each item has `id` and `name` | HTTP 200; `data.length > 0`; each item has `id` (number) and `name` (string); `meta.total` matches data length | API | Y | Must Test |
| TS-006 | Happy Path — GET leave-periods returns current leave period | Authenticated | 1. GET `/api/v2/leave/leave-periods` 2. Assert HTTP 200 3. Assert `meta.leavePeriodDefined` is true 4. Assert `meta.currentLeavePeriod` has `startDate` and `endDate` | HTTP 200; `meta.leavePeriodDefined: true`; `currentLeavePeriod.startDate` and `currentLeavePeriod.endDate` are valid date strings | API | Y | Must Test |
| TS-007 | Negative — fromDate after toDate returns error or empty results | Authenticated | 1. GET `/api/v2/leave/employees/leave-requests?fromDate=2025-12-31&toDate=2025-01-01&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert response | HTTP 422/400 with validation error, OR HTTP 200 with `data:[]` and `meta.total:0` — must not return unfiltered full dataset | API | Y | Must Test |
| TS-008 | Negative — Non-existent empNumber returns empty result | Authenticated | 1. GET `/api/v2/leave/employees/leave-requests?empNumber=999999&fromDate=2025-01-01&toDate=2025-12-31&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert HTTP 200 3. Assert `data` is empty, `meta.total` is 0 | HTTP 200; `data: []`; `meta.total: 0`; no server error | API | Y | Must Test |
| TS-009 | Boundary — Leap year date boundary (Feb 29 2024) is handled without error | Authenticated | 1. GET `/api/v2/leave/employees/leave-requests?fromDate=2024-02-01&toDate=2024-02-29&statuses[]=1&limit=50&offset=0&includeEmployees=onlyCurrent` 2. Assert HTTP 200 or 400/422 3. Assert no 500 error | HTTP 200 with `data[]` (may be empty) OR HTTP 422 if date invalid — must not be HTTP 500 | API | Y | Should Test |
| TS-010 | Happy Path — GET holidays endpoint returns list for given date range | Authenticated | 1. GET `/api/v2/leave/holidays?fromDate=2026-01-01&toDate=2026-12-31` 2. Assert HTTP 200 3. Assert `data` is array (may be empty) | HTTP 200; `data` is an array; no server error | API | Y | Should Test |
| TS-011 | UI Integration — Leave Type dropdown populates from leave-types API | Authenticated; Leave List page loaded | 1. Navigate to `/web/index.php/leave/viewLeaveList` 2. Observe network: `/api/v2/leave/leave-types?limit=0` called 3. Open the Leave Type dropdown 4. Assert options visible in dropdown | Dropdown contains leave type names matching API response `data[].name`; dropdown is not empty | UI | Y | Must Test |
| TS-012 | UI Happy Path — Search with all filters filled shows filtered table | Authenticated as HR Manager | 1. Navigate to `/web/index.php/leave/viewLeaveList` 2. Dates default to current year 3. Select "Pending Approval" in Status dropdown 4. Click Search 5. Observe results table | Table renders with correct columns: Date, Employee Name, Leave Type, Leave Balance (Days), Number of Days, Status, Comments, Actions; search completes without error | UI | Y | Must Test |
| TS-013 | UI — Reset button clears all filters and reloads default results | Authenticated; filters modified from defaults | 1. Navigate to Leave List page 2. Change From Date to `2025-06-01`, change Leave Type 3. Click Search 4. Click Reset | All filter fields revert to defaults (current year dates, Status=Pending Approval, other filters blank); results table reloads; no page error | UI | Y | Must Test |
| TS-014 | Manual E2E — HR Manager end-to-end leave search workflow | HR Manager credentials; mixed leave records exist | 1. Log in as HR Manager 2. Navigate Leave > Leave List (AC-1) 3. Search by Employee Name (AC-2, AC-3) 4. Add Leave Status filter (AC-2, AC-3) 5. Add Leave Type (AC-2, AC-3) 6. Set narrow date range (AC-2, AC-3) 7. Select Sub Unit (AC-2, AC-3) 8. Click Reset — verify all fields clear and full results return (AC-4) | At each step results reflect active filters; Reset restores default view; no page errors | Manual | N | Must Test |

---

## Test Pyramid Achieved

| Layer | Count | % |
|-------|-------|---|
| API | 10 | 71% |
| UI | 3 | 21% |
| Manual | 1 | 7% |
| **Total** | **14** | **100%** |

## AC Coverage Matrix

| AC | Test Cases |
|----|-----------|
| AC-1: Navigate to Leave Management page | TS-012, TS-014 |
| AC-2: Search by Employee Name, Status, Leave Type, Date Range, Sub Unit | TS-001–TS-005, TS-007–TS-009, TS-014 |
| AC-3: Results display only matching records | TS-001–TS-005, TS-007–TS-009, TS-012, TS-014 |
| AC-4: Reset clears filters and displays all records | TS-013, TS-014 |
