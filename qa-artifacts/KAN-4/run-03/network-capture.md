# Network Capture — KAN-4 run-03

Captured during: MCP browser session (login, Employee List page, Add Employee page, Employee Profile page)

## Distinct Endpoints Observed

| # | Method | Path | Status | Notes |
|---|--------|------|--------|-------|
| 1 | GET | `/api/v2/pim/employees?limit=50&offset=0&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC` | 200 | Employee list with pagination, filter, sort params. Response: `{data:[{empNumber,lastName,firstName,middleName,employeeId,terminationId,jobTitle,jobCategory,subUnit,location,employmentStatus}], meta:{total}, rels:[]}` |
| 2 | GET | `/api/v2/pim/employees` (bare, from Add Employee page load) | 200 | Used to pre-populate employee ID suggestion on add form |
| 3 | GET | `/api/v2/pim/employees/{empNumber}` | 200 | Single employee summary. Response: `{data:{empNumber,lastName,firstName,middleName,employeeId,terminationId}}` |
| 4 | GET | `/api/v2/pim/employees/{empNumber}/personal-details` | 200 | Full personal details. Response: `{data:{empNumber,lastName,firstName,middleName,employeeId,otherId,drivingLicenseNo,drivingLicenseExpiredDate,gender,maritalStatus,birthday,terminationId,nationality:{id,name}}}` |
| 5 | GET | `/api/v2/pim/employees/{empNumber}/custom-fields?screen=personal` | 200 | Custom fields for personal screen |
| 6 | GET | `/api/v2/pim/employees/{empNumber}/screen/personal/attachments?limit=50&offset=0` | 200 | Attachments list for employee profile |
| 7 | GET | `/api/v2/admin/employment-statuses?limit=0` | 200 | Reference data: all employment status options |
| 8 | GET | `/api/v2/admin/job-titles?limit=0` | 200 | Reference data: all job title options |
| 9 | GET | `/api/v2/admin/subunits` | 200 | Reference data: org subunit hierarchy |

## Inferred but not directly observed (write operations)

These endpoints are strongly implied by CRUD features in the stories, but were not directly observed as they require POST/PUT/DELETE operations that were not triggered during read-only seeding:

| # | Method | Path | Story |
|---|--------|------|-------|
| 10 | POST | `/api/v2/pim/employees` | KAN-7 (Add Employee) |
| 11 | PUT | `/api/v2/pim/employees/{empNumber}/personal-details` | KAN-8 (Update Employee) |
| 12 | DELETE | `/api/v2/pim/employees` (bulk delete with ids in body) | KAN-9 (Delete Employee) |
| 13 | POST | `/api/v2/pim/employees/{empNumber}/screen/personal/attachments` | KAN-10 (Documents) |

## Reclassification Decisions

| Endpoint | Decision | Reason |
|----------|----------|--------|
| GET /api/v2/pim/employees (list) | ADD API test case TC-A01 | Verifies core employee list behavior independently of UI rendering |
| GET /api/v2/pim/employees/{empNumber} | ADD API test case TC-A02 | Verifies single employee retrieval |
| GET /api/v2/pim/employees/{empNumber}/personal-details | ADD API test case TC-A03 | Verifies personal details schema |
| POST /api/v2/pim/employees | ADD API test case TC-A04 | Verifies employee creation at API layer |
| PUT /api/v2/pim/employees/{empNumber}/personal-details | ADD API test case TC-A05 | Verifies update at API layer |
| DELETE /api/v2/pim/employees | ADD API test case TC-A06 | Verifies deletion at API layer |
| GET /api/v2/pim/employees/{empNumber}/screen/personal/attachments | ADD API test case TC-A07 | Verifies attachment list API |
| GET /api/v2/admin/employment-statuses + /admin/job-titles + /admin/subunits | ADD API test case TC-A08 | Verifies reference data endpoints that populate search dropdowns |
