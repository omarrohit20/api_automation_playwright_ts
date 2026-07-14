# Network Capture — KAN-4 Run-04
**Date:** 2026-07-14  
**Captured during:** MCP browser walkthrough of Employee List, Add Employee, and Employee Profile pages.

---

## Distinct Endpoints Observed

| # | Method | Path | Status | Notes |
|---|--------|------|--------|-------|
| 1 | GET | /api/v2/pim/employees?limit=50&offset=0&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC | 200 | Employee list with detailed model, sort, paginate |
| 2 | GET | /api/v2/pim/employees?nameOrId={value} | 200 | Search/filter by name or employee ID |
| 3 | GET | /api/v2/pim/employees | 200 | Basic employee list (no params) — used in Add Employee page typeahead |
| 4 | GET | /api/v2/pim/employees/{empNumber} | 200 | Single employee record by empNumber. Response: `{empNumber, firstName, lastName, middleName, employeeId, terminationId}` |
| 5 | GET | /api/v2/pim/employees/{empNumber}/personal-details | 200 | Extended personal details. Response includes: `gender, maritalStatus, birthday, nationality, drivingLicenseNo, otherId, terminationId` |
| 6 | GET | /api/v2/pim/employees/{empNumber}/custom-fields?screen=personal | 200 | Custom fields for personal screen |
| 7 | GET | /api/v2/pim/employees/{empNumber}/screen/personal/attachments?limit=50&offset=0 | 200 | Attachments on employee personal screen |
| 8 | POST | /api/v2/pim/employees | 201 | Create employee. Body: `{firstName, lastName, middleName?, employeeId?}` |
| 9 | PUT | /api/v2/pim/employees/{empNumber}/personal-details | 200 | Update personal details. Body mirrors personal-details GET response shape |
| 10 | DELETE | /api/v2/pim/employees | 200 | Bulk delete. Body: `{"ids": [empNumber1, ...]}` |
| 11 | GET | /api/v2/admin/employment-statuses?limit=0 | 200 | Reference: all employment statuses. Response: `{data: [{id, name}], meta: {total}}` |
| 12 | GET | /api/v2/admin/job-titles?limit=0 | 200 | Reference: all job titles. Response: `{data: [{id, name, ...}], meta: {total}}` |
| 13 | GET | /api/v2/admin/subunits | 200 | Reference: org sub-units. Response: `{data: [{id, name}]}` |

---

## Reclassification Pass

All 13 distinct endpoints above are already covered by API test cases in test-cases.md:

| Endpoint | Existing API Test Case(s) | Action |
|----------|--------------------------|--------|
| GET /api/v2/pim/employees (list, paginate, filter) | TC-001 through TC-008 | Already API — no change |
| GET /api/v2/pim/employees/{empNumber} | TC-017 | Already API — no change |
| GET /api/v2/pim/employees/{empNumber}/personal-details | TC-019 (indirectly via verify step) | Adding TC-033 (see below) |
| GET /api/v2/pim/employees/{empNumber}/custom-fields?screen=personal | Not covered | Not adding — custom fields are admin-configured metadata, not part of KAN-4 AC; documenting reason |
| GET /api/v2/pim/employees/{empNumber}/screen/personal/attachments | Not covered | Not adding — attachment management is outside KAN-4 AC scope (no AC mentions attachments); documenting reason |
| POST /api/v2/pim/employees | TC-009 through TC-016 | Already API — no change |
| PUT /api/v2/pim/employees/{empNumber}/personal-details | TC-019, TC-020 | Already API — no change |
| DELETE /api/v2/pim/employees | TC-021 through TC-023 | Already API — no change |
| GET /api/v2/admin/employment-statuses | TC-025 | Already API — no change |
| GET /api/v2/admin/job-titles | TC-024 | Already API — no change |
| GET /api/v2/admin/subunits | TC-026 | Already API — no change |

### New test case added from capture:

**TC-033** — Get employee personal-details by empNumber returns extended profile  
- Type: API | Automated: Y | Priority: Must Test  
- Steps: GET /api/v2/pim/employees/{empNumber}/personal-details  
- Expected: HTTP 200; response contains `gender`, `maritalStatus`, `birthday`, `nationality.name`, `drivingLicenseNo`; `empNumber` matches requested value

### Endpoints not added (with reasons):
- `/api/v2/pim/employees/{empNumber}/custom-fields?screen=personal` — Custom fields are admin-configured metadata not referenced in any KAN-4 acceptance criterion; testing them would be out of scope for this Epic and subject to environment-specific configuration variation.
- `/api/v2/pim/employees/{empNumber}/screen/personal/attachments` — Attachment management is not mentioned in the KAN-4 Epic description or any linked stories. Adding API tests for it would exceed this Epic's scope.
