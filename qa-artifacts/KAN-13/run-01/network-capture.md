# Network Capture — KAN-13 run-01
**Captured during:** MCP browser session — Login + Leave List page load + Search + Reset  
**Date:** 2026-07-14

---

## Distinct Endpoints Captured

| # | Method | Path | Status | Notes |
|---|--------|------|--------|-------|
| 1 | GET | `/api/v2/leave/employees/leave-requests` | 200 | Core search endpoint. Accepts query params: `limit`, `offset`, `fromDate`, `toDate`, `includeEmployees`, `statuses[]`, `leaveTypeId`, `subunitId`, `empNumber`. Returns `{data: [...], meta: {total: N}, rels: []}` |
| 2 | GET | `/api/v2/leave/leave-periods` | 200 | Returns list of leave period objects `{startDate, endDate}` plus meta with `leavePeriodDefined` and `currentLeavePeriod`. No params required. |
| 3 | GET | `/api/v2/leave/workweek?model=indexed` | 200 | Returns workweek configuration keyed by day index. Populates calendar widget. |
| 4 | GET | `/api/v2/leave/leave-types?limit=0` | 200 | Returns all leave types: `{id, name, deleted, situational}`. 10 types in demo data (US and CAN variants). |
| 5 | GET | `/api/v2/leave/holidays?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD` | 200 | Returns holiday list for the given date range. Populated by date-range picker. |

---

## Key Request/Response Shapes

### 1. GET /api/v2/leave/employees/leave-requests (with filters)
**Full observed URL (search with Pending status):**
```
/api/v2/leave/employees/leave-requests?limit=50&offset=0&fromDate=2026-01-01&toDate=2026-12-31&includeEmployees=onlyCurrent&statuses[]=1
```
**Response (no matching records in demo data for 2026):**
```json
{"data":[],"meta":{"total":0},"rels":[]}
```
**Response (default load, no date filter):**
```json
{"data":[],"meta":{"total":0},"rels":[]}
```

### 2. GET /api/v2/leave/leave-periods
```json
{
  "data": [
    {"startDate":"2020-01-01","endDate":"2020-12-31"},
    ...
    {"startDate":"2026-01-01","endDate":"2026-12-31"}
  ],
  "meta": {
    "leavePeriodDefined": true,
    "currentLeavePeriod": {"startDate":"2026-01-01","endDate":"2026-12-31"}
  },
  "rels": []
}
```

### 4. GET /api/v2/leave/leave-types?limit=0
```json
{
  "data": [
    {"id":1,"name":"US - Vacation","deleted":false,"situational":false},
    {"id":2,"name":"US - FMLA","deleted":false,"situational":false},
    ...
  ],
  "meta": {"total":10},
  "rels": []
}
```

---

## Status Enum Values (observed)
- `statuses[]=1` → Pending Approval (as shown in UI dropdown default)
- Additional statuses exist in the UI: Approved, Rejected, Cancelled, etc. (exact numeric IDs to be confirmed via API exploration in test scripts)

---

## Reclassification Decisions

All 5 endpoints are GET/read endpoints that are safe to exercise against the shared demo environment. Decisions per endpoint:

| Endpoint | Decision |
|----------|----------|
| `/api/v2/leave/employees/leave-requests` | **Add API test cases** — this is the core search endpoint and should be tested at the API layer with all supported filter combinations. Multiple test cases added to test-cases.md. |
| `/api/v2/leave/leave-periods` | **Add API test case** — reference data; verify 200, correct structure, currentLeavePeriod present. |
| `/api/v2/leave/workweek` | **No API test case** — workweek config is infrastructure/config data, not tied to KAN-13 ACs. Covered implicitly by UI tests. |
| `/api/v2/leave/leave-types` | **Add API test case** — populates the Leave Type filter dropdown; verify 200, non-empty, each item has id and name. |
| `/api/v2/leave/holidays` | **Add API test case** — date-range dependent; verify 200, correct shape. Low-risk. |

---

## Note on Sub Unit Filter
The Sub Unit dropdown in the UI was not observed making a distinct `/api/v2/admin/subunits` call during this session (it was already populated from a prior PIM page session). The pim.ts wrapper already includes `getSubUnits()` calling `/api/v2/admin/subunits` — this endpoint is already covered by existing PIM tests (TC-026). No new subunit test case needed for KAN-13.
