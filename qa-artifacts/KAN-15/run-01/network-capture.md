# Network Capture — KAN-15 run-01

**Captured during:** Step 3 (live MCP browser walkthrough of Admin > User Management > Users)  
**Date:** 2026-07-15  
**Base URL:** https://opensource-demo.orangehrmlive.com/web/index.php

---

## Distinct API Endpoints Discovered

| # | Method | Path | Key Query Params | Status | Request Shape | Response Shape | Notes |
|---|--------|------|-----------------|--------|---------------|----------------|-------|
| 1 | GET | /api/v2/admin/users | limit, offset, sortField, sortOrder | 200 | — (GET, cookie auth) | `{ data: [...], meta: { total }, rels: [] }` | Initial page load |
| 2 | GET | /api/v2/admin/users | **username=Admin** | 200 | — | `{ data: [1 item], meta: { total: 1 } }` | Search by username |
| 3 | GET | /api/v2/admin/users | **userRoleId=2** | 200 | — | `{ data: [...ESS users], meta: { total } }` | Search by user role (ESS=2, Admin=1) |
| 4 | GET | /api/v2/admin/users | **status=1** | 200 | — | `{ data: [...enabled users], meta: { total } }` | Search by status (1=Enabled, 0=Disabled) |
| 5 | GET | /api/v2/admin/users | **username=zzz_nonexistent_user_xyz** | 200 | — | `{ data: [], meta: { total: 0 }, rels: [] }` | No-results search |

---

## Verified Response Shape (from endpoint #1 — full list)

```json
{
  "data": [
    {
      "id": 1,
      "userName": "Admin",
      "deleted": false,
      "status": true,
      "employee": {
        "empNumber": 7,
        "employeeId": "muser",
        "firstName": "manda",
        "middleName": "akhil",
        "lastName": "user",
        "terminationId": null
      },
      "userRole": {
        "id": 1,
        "name": "Admin",
        "displayName": "Admin"
      }
    }
  ],
  "meta": {
    "total": 8
  },
  "rels": []
}
```

**Users in demo at time of capture (8 total):**
- Admin (role: Admin, status: true/Enabled)
- cVZfu (role: ESS, status: true)
- FMLName (role: ESS, status: true)
- FMLName1 (role: ESS, status: true)
- hicksbeverly (role: ESS, status: true)
- Jobinsam@6742 (role: ESS, status: true)
- Rosanna (role: ESS, status: true)
- TESTUSER (role: Admin, status: true)

**Important:** All current users are `status: true` (Enabled). No disabled users exist at time of capture. TC-KAN17-03 (search by Disabled status) will return empty results in current state but the API parameter still works.

---

## Key Parameter Discoveries (correcting initial test design assumptions)

| Parameter | Assumed (from test-cases.md) | Actual (from network capture) | Impact |
|-----------|------------------------------|-------------------------------|--------|
| Username search query param | `userName` | `username` (lowercase) | TC-KAN17-01, TC-KAN17-04, TC-KAN17-05 updated |
| Status filter value | "Enabled"/"Disabled" (string) | `1` / `0` (integer) | TC-KAN17-03 updated |
| Status field in response | String | boolean (`true`/`false`) | Assertion logic updated |
| User Role IDs | Not known | Admin=1, ESS=2 | TC-KAN17-02 confirmed |

---

## Reclassification Pass

All GET endpoints discovered above are already covered by the test cases in `test-cases.md`. No new API test cases are being added from network capture because:

- Endpoint #1 (list): covered by TC-KAN16-01 (happy path) and TC-KAN16-02 (pagination)
- Endpoint #2 (search by username): covered by TC-KAN17-01, TC-KAN17-04, TC-KAN17-05
- Endpoint #3 (search by role): covered by TC-KAN17-02
- Endpoint #4 (search by status): covered by TC-KAN17-03
- Endpoint #5 (no-results): covered by TC-KAN17-04

No additional POST/PUT/DELETE endpoints were discovered (create/update/delete are out of scope per KAN-16/KAN-17 ACs).

No individual user GET by ID (`/api/v2/admin/users/{id}`) was called by the UI — the list view does not navigate to individual user detail. TC-KAN16-03 (get by ID) is removed from scope as it was not in the original ACs and was not observed in the network capture. The test-cases.md "TC-KAN16-03" (unauthenticated rejection) is retained as it validates AC-implied authorization behavior.

---

## UI Observations (no-results state)

Confirmed "No Records Found" DOM element:
```
generic[class~=oxd-table-card]: "No Records Found"
```
Selector that works: `.oxd-table-body .oxd-table-card` containing text "No Records Found"
Or: text selector `text=No Records Found`

---

## Auth Pattern

All API calls use:
- `Cookie` header with session cookies (auto-sent by browser)
- The app uses XSRF-TOKEN cookie which must be extracted and sent as `X-XSRF-TOKEN` header on mutation requests (GET requests do not require it per observed behavior)
- Session is established by the existing `auth.setup.ts` which writes to `playwright/.auth/admin.json`
