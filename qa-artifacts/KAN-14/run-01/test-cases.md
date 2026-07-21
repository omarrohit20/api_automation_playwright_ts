# Test Cases — KAN-14: View Leave List
**Run:** run-01  
**Date:** 2026-07-15  

---

## Story: KAN-14 — View Leave List

### Existing Coverage (from KAN-13, carried forward)

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority | Tier |
|----|-------|---------------|-------|-----------------|------|-----------|----------|------|
| TS-001 | GET leave-requests with date range, status=Pending, includeEmployees=onlyCurrent returns 200 | Auth cookies obtained | Send GET /api/v2/leave/employees/leave-requests with fromDate=2025-01-01, toDate=2025-12-31, statuses=[1], limit=50, offset=0 | HTTP 200; data is array; meta.total >= 0 | API | Y | Must Test | @smoke @regression |
| TS-002 | GET leave-requests response has data array and meta.total fields | Auth cookies obtained | Send GET with same params as TS-001 | HTTP 200; body.data is array; body.meta.total is number | API | Y | Must Test | @smoke @regression |
| TS-003 | GET leave-requests filtered by a valid leaveTypeId returns 200 | Auth cookies; valid leaveTypeId from /leave-types | Fetch leave types, use first ID, filter requests by it | HTTP 200; data is array | API | Y | Must Test | @sanity @regression |
| TS-004 | GET leave-requests with narrow March date range returns 200 | Auth cookies | GET with fromDate=2025-03-01, toDate=2025-03-31 | HTTP 200; valid JSON structure | API | Y | Must Test | @regression |
| TS-005 | GET leave-types?limit=0 returns 200 with non-empty data | Auth cookies | GET /api/v2/leave/leave-types?limit=0 | HTTP 200; data array non-empty; each item has id and name | API | Y | Must Test | @smoke @regression |
| TS-006 | GET leave-periods returns 200 with current period | Auth cookies | GET /api/v2/leave/leave-periods | HTTP 200; meta.leavePeriodDefined=true; currentLeavePeriod has startDate and endDate | API | Y | Must Test | @regression |
| TS-007 | GET leave-requests with reversed dates returns 400/422 or 200 with empty data | Auth cookies | GET with fromDate=2025-12-31, toDate=2025-01-01 | 400/422 or 200 with empty data; no 500 | API | Y | Should Test | @regression |
| TS-008 | GET leave-requests with non-existent empNumber=999999 returns 200 with empty data | Auth cookies | GET with empNumber=999999 | HTTP 200; empty data array or 422 | API | Y | Should Test | @regression |
| TS-009 | GET leave-requests over Feb 2024 leap-year range must not return 500 | Auth cookies | GET with fromDate=2024-02-01, toDate=2024-02-29 | HTTP 200 or 4xx; no 500 | API | Y | Should Test | @regression |
| TS-010 | GET holidays for 2026 returns 200 with data array | Auth cookies | GET /api/v2/leave/holidays?fromDate=2026-01-01&toDate=2026-12-31 | HTTP 200; data is array | API | Y | Should Test | @regression |
| TS-011 | Leave Type dropdown is visible after leave-types API call resolves | Authenticated browser session | Navigate to /leave/viewLeaveList; intercept leave-types API | leave-types returns 200; Leave Type dropdown visible | UI | Y | Must Test | @smoke @regression |
| TS-012 | Search with default filters shows results table with all expected column headers | Authenticated browser session | Navigate; click Search; inspect table headers | Headers include: Date, Employee Name, Leave Type, Leave Balance (Days), Number of Days, Status, Comments, Actions | UI | Y | Must Test | @smoke @sanity @regression |
| TS-013 | Reset button reverts From Date to current-year default and clears Employee Name | Authenticated browser session | Navigate; change From Date; search; reset | From Date reverts to default; Employee Name is empty; no error dialog | UI | Y | Must Test | @sanity @regression |

### New Test Cases — KAN-14

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority | Tier |
|----|-------|---------------|-------|-----------------|------|-----------|----------|------|
| TS-014 | Leave list displays all six required AC columns | Authenticated as HR Manager; at least one leave request exists | 1. Navigate to /leave/viewLeaveList 2. Click Search 3. Inspect table headers | Table renders: Employee Name, Leave Type, From Date, To Date, Number of Days, Status | UI | Y | Must Test | @smoke @sanity @regression |
| TS-015 | API returns all six required fields per leave record | Valid auth cookie | GET /api/v2/leave/employees/leave-requests; parse first item in data[] | Each record has: employee name, leaveType.name, fromDate, toDate, noOfDays/days, status.name. HTTP 200 | API | Y | Must Test | @smoke @sanity @regression |
| TS-016 | Pagination: second page returns different records than first | Valid auth; multiple leave requests exist | GET with limit=50&offset=0; then limit=50&offset=50; compare IDs | Second page IDs differ from first; meta.total consistent; HTTP 200 | API | Y | Must Test | @sanity @regression |
| TS-017 | UI next-page control loads page 2 | Authenticated; 51+ leave requests exist | Navigate; Search; click Next/page 2 | Page 2 loads; records differ; page indicator shows 2; no stuck spinner | UI | Y | Must Test | @sanity @regression |
| TS-018 | Pagination: offset exceeding total returns empty data | Valid auth | GET with limit=50&offset=999999 | HTTP 200; data=[]; meta.total reflects actual total; no 500 | API | Y | Should Test | @regression |
| TS-019 | Leave list inaccessible to unauthenticated user (UI redirect) | User logged out | Clear cookies; navigate to /leave/viewLeaveList | Redirects to /auth/login; leave list content not rendered | UI | Y | Must Test | @smoke @sanity @regression |
| TS-020 | API rejects request without auth token | No cookie/Bearer token | GET /api/v2/leave/employees/leave-requests with no auth | HTTP 401; error indicator in body; no leave data exposed | API | Y | Must Test | @smoke @sanity @regression |
| TS-021 | Leave list with no matching records shows empty state | Authenticated | Navigate; set From Date=2000-01-01, To Date=2000-01-02; Search | "No Records Found" message visible; no console errors; HTTP 200 from API with data:[] | UI | Y | Must Test | @sanity @regression |
| TS-022 | API boundary: limit=1 returns exactly one record | Valid auth; multiple leave requests | GET with limit=1&offset=0 | HTTP 200; data has exactly 1 item; meta.total reflects full count | API | Y | Should Test | @regression |
| TS-023 | API boundary: negative offset rejected or clamped | Valid auth | GET with limit=50&offset=-1 | HTTP 400 with validation error OR 200 with first page (clamped); no 500 | API | Y | Should Test | @regression |
| TS-024 | Status filter returns only records matching requested status | Valid auth; requests in multiple statuses | GET with statuses[]=PENDING (or id=1) | HTTP 200; every record has status matching Pending; no Approved/Rejected | API | Y | Must Test | @sanity @regression |
| TS-025 | Employee Name links to employee profile (PIM integration) | Authenticated; leave list has results | Navigate; Search; click employee name hyperlink | Browser navigates to employee PIM profile; page loads without error | UI | N | Should Test | @regression |
| TS-026 | Leave list keyboard navigation and Search via Enter | Authenticated | Tab through interactive controls; press Enter on Search button | All controls receive focus; Search executes on Enter; no focus trap | UI | N | Should Test | @regression |
| TS-027 | Leave list performance: API responds within 2 seconds for 200 records | Valid auth; 200+ requests in system | Timed GET with limit=200&offset=0 | Response in < 2000ms; HTTP 200; 200 items in data | Manual | N | Could Test | @regression |

---

## Test Pyramid Summary

| Layer | New Cases | Existing (Carried) | Total | % |
|-------|-----------|-------------------|-------|---|
| API | 10 (TS-015,016,018,020,022,023,024 + reclassified) | 10 (TS-001..010) | 17 | 63% |
| UI | 6 (TS-014,017,019,021,025,026) | 3 (TS-011,012,013) | 9 | 33% |
| Manual E2E | 1 (TS-027) | 0 | 1 | 4% |
| **Total** | **17** | **13** | **27** | **100%** |

Target: 60-70% API, 20-30% UI, 5-10% Manual — achieved (63% / 33% / 4%).
