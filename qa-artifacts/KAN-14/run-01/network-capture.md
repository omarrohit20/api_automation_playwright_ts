# Network Capture — KAN-14: View Leave List
**Run:** run-01  
**Date:** 2026-07-15  
**Captured during:** MCP browser walkthrough of Leave List page (login + navigate + Search)

---

## Distinct API Endpoints Observed

| # | Method | Path | Status | Notes |
|---|--------|------|--------|-------|
| 1 | GET | /api/v2/leave/employees/leave-requests?limit=50&offset=0&includeEmployees=onlyCurrent | 200 | Initial page load (pre-Search); returns `{"data":[],"meta":{"total":0}}` — no date filter |
| 2 | GET | /api/v2/leave/leave-periods | 200 | Leave period config; called on page mount |
| 3 | GET | /api/v2/leave/workweek?model=indexed | 200 | **New endpoint not covered by KAN-13.** Returns workweek day config: `{"data":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":8,"0":8},"meta":[]}`  |
| 4 | GET | /api/v2/leave/leave-types?limit=0 | 200 | Reference data for Leave Type dropdown |
| 5 | GET | /api/v2/leave/holidays?fromDate=2026-01-01&toDate=2026-12-31 | 200 | Holiday calendar for current year |
| 6 | GET | /api/v2/leave/employees/leave-requests?limit=50&offset=0&fromDate=2026-01-01&toDate=2026-12-31&includeEmployees=onlyCurrent&statuses[]=1 | 200 | Search result with default Pending Approval filter; returns `{"data":[],"meta":{"total":0}}` |

---

## Reclassification Analysis

### New endpoint: GET /api/v2/leave/workweek?model=indexed

This endpoint was not documented in the ticket and was not covered by KAN-13's API tests. It returns work-week configuration used by the Leave List page to render leave calendars correctly.

**Decision: Add API test case TS-028 for this endpoint in this run.**
- Test: GET /api/v2/leave/workweek?model=indexed returns HTTP 200 with a data object containing integer keys 0-6 (days of week).
- Reasoning: The Leave List feature depends on this endpoint being available; if it returns a non-200, the page may malfunction.
- Tier: @smoke @regression

### Existing endpoints (already covered by TS-001..TS-010):
- /api/v2/leave/employees/leave-requests — covered by TS-001..TS-009
- /api/v2/leave/leave-types — covered by TS-005
- /api/v2/leave/leave-periods — covered by TS-006
- /api/v2/leave/holidays — covered by TS-010

---

## Updated Test Cases (post-reclassification)

| ID | Title | Type | Automated | Tier |
|----|-------|------|-----------|------|
| TS-028 | GET /api/v2/leave/workweek?model=indexed returns 200 with day-keyed data object | API | Y | @smoke @regression |
