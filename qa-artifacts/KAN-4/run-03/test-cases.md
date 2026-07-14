# Test Cases — KAN-4: Employee Information Management
**Run:** 03 | **Date:** 2026-07-14 | **Total:** 29

## Test Pyramid Mix
| Layer | Count | % |
|-------|-------|---|
| API | 18 | 62% |
| UI | 9 | 31% |
| Manual E2E | 2 | 7% |
| **Total** | **29** | **100%** |

---

## KAN-5: View Employee List

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN5-TC-001 | Employee list displays all required columns | Logged in as HR Admin; at least 1 employee exists | 1. Navigate to PIM > Employee List. 2. Observe the table header and first row. | Table renders columns: Id, First Name, Last Name, Job Title, Employment Status, Sub Unit, Supervisor. Each row is populated. | UI | Y | Must Test |
| KAN5-TC-002 (TC-A01) | GET /api/v2/pim/employees returns paginated list | Valid session available | 1. GET /api/v2/pim/employees?limit=10&offset=0&sortField=lastName&sortOrder=ASC. 2. Inspect response. | HTTP 200; body contains `{data:[...], meta:{total,limit,offset}}`; data length <= 10; each record has empNumber, firstName, lastName. | API | Y | Must Test |
| KAN5-TC-003 | Pagination advances to next page | >50 employees exist | 1. Navigate to Employee List. 2. Note page 1 records. 3. Click Next pagination control. | Page 2 records differ from page 1; page indicator updates; total count is consistent. | UI | Y | Must Test |
| KAN5-TC-004 | GET employees with offset beyond total returns empty data | Valid session | 1. GET /api/v2/pim/employees?limit=50&offset=999999. | HTTP 200; data is `[]`; meta.total still reflects actual count. | API | Y | Should Test |

---

## KAN-6: Search Employee

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN6-TC-001 | Search by Employee Name autocomplete | HR Admin logged in; known employee exists | 1. Navigate to Employee List. 2. Type partial name in Employee Name field. 3. Click Search. | Only matching employee records are shown. | UI | Y | Must Test |
| KAN6-TC-002 | Search by Employee Id returns exact match | Employee with known Id exists | 1. Enter known Id in Employee Id field. 2. Click Search. | Exactly one record returned matching the Id. | API | Y | Must Test |
| KAN6-TC-003 | Search with no match shows "No Records Found" | HR Admin logged in | 1. Enter "ZZZNONEXISTENT" in Employee Name. 2. Click Search. | "No Records Found" message displayed; no rows in table body. | UI | Y | Must Test |
| KAN6-TC-004 | Combinatorial filter returns single matching record | Known employee with specific status, title, subunit, supervisor | 1. Set multiple filter criteria matching one employee. 2. Click Search. | Exactly one record returned matching all filters. | API | Y | Should Test |
| KAN6-TC-005 (TC-A08) | GET reference data endpoints return valid lookup lists | Valid session | 1. GET /api/v2/admin/employment-statuses. 2. GET /api/v2/admin/job-titles. 3. GET /api/v2/admin/subunits. | All return HTTP 200; each returns non-empty array with id and name fields. | API | Y | Must Test |
| KAN6-TC-006 | Include past employees filter surfaces terminated employee | Terminated employee record exists | 1. Set Include to "Past Employees". 2. Click Search. | Terminated employee appears; active-only employees excluded. | API | Y | Should Test |
| KAN6-TC-007 | nameOrId with special characters does not cause 500 | Valid session | 1. GET /api/v2/pim/employees?nameOrId=<script>alert(1)</script>. | HTTP 200 or 400; valid JSON response; no 500 error. | API | Y | Must Test |

---

## KAN-7: Add Employee

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN7-TC-001 | Add employee with mandatory fields via UI | HR Admin logged in; unique Employee Id prepared | 1. Navigate to Add Employee. 2. Enter First Name "TestFirst", Last Name "TestLast". 3. Note/enter Employee Id. 4. Click Save. | New profile page loads; employee appears in Employee List search by name. | UI | Y | Must Test |
| KAN7-TC-002 (TC-A04) | POST /api/v2/pim/employees creates employee and returns 201 | Valid session; unique Employee Id | 1. POST /api/v2/pim/employees with `{firstName, lastName, employeeId}`. 2. Inspect response. | HTTP 201; body contains new employee's empNumber, firstName, lastName, employeeId; GET by empNumber returns same data. | API | Y | Must Test |
| KAN7-TC-003 | Add employee without First Name shows validation error | HR Admin on Add Employee page | 1. Leave First Name blank. 2. Enter Last Name and Employee Id. 3. Click Save. | Inline "Required" validation on First Name; no record created. | UI | Y | Must Test |
| KAN7-TC-004 | Add employee without Last Name shows validation error | HR Admin on Add Employee page | 1. Enter First Name. 2. Leave Last Name blank. 3. Enter Employee Id. 4. Click Save. | Inline "Required" validation on Last Name; form does not submit. | UI | Y | Must Test |
| KAN7-TC-005 | POST with duplicate Employee Id returns error | Employee with Id "DUP-001" exists | 1. POST /api/v2/pim/employees with employeeId "DUP-001". | HTTP 400 or 409; error body indicates duplicate Employee Id; no second record created. | API | Y | Must Test |
| KAN7-TC-006 | First Name at max boundary (100 chars) is accepted | HR Admin on Add Employee page | 1. Enter 100-char First Name string. 2. Enter Last Name and unique Id. 3. Click Save. | Employee saved; profile shows full 100-char name. | API | Y | Should Test |
| KAN7-TC-007 | First Name exceeding max boundary (101 chars) is rejected | HR Admin on Add Employee page | 1. Enter 101-char First Name. 2. Enter Last Name and Id. 3. Click Save. | Validation error on First Name field; record not created. | UI | Y | Should Test |

---

## KAN-8: Update Employee Information

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN8-TC-001 | Update employee First Name via UI and verify persistence | Employee record exists; HR Admin logged in | 1. Navigate to employee profile. 2. Change First Name to "UpdatedFirst". 3. Click Save. 4. Navigate away and reopen profile. | First Name shows "UpdatedFirst"; other fields unchanged. | UI | Y | Must Test |
| KAN8-TC-002 (TC-A05) | PUT /api/v2/pim/employees/{empNumber}/personal-details updates employee | Valid session; known empNumber | 1. PUT personal-details with updated firstName/lastName. 2. Inspect response. | HTTP 200; response reflects updated values; subsequent GET returns updated values. | API | Y | Must Test |
| KAN8-TC-003 (TC-A03) | GET /api/v2/pim/employees/{empNumber}/personal-details returns full details | Valid session; employee exists | 1. GET /api/v2/pim/employees/{empNumber}/personal-details. | HTTP 200; body contains full personal details object with all expected fields. | API | Y | Must Test |
| KAN8-TC-004 (TC-A02) | GET /api/v2/pim/employees/{empNumber} returns single employee summary | Valid session; employee exists | 1. GET /api/v2/pim/employees/{empNumber}. | HTTP 200; body contains correct employee summary for empNumber. | API | Y | Must Test |
| KAN8-TC-005 | PUT personal-details for non-existent empNumber returns 404 | Valid session | 1. PUT /api/v2/pim/employees/999999/personal-details with valid body. | HTTP 404; structured error; no data mutation. | API | Y | Must Test |
| KAN8-TC-006 | Concurrent updates — last write wins (Manual E2E) | Two HR Admin sessions; same employee open in both | 1. Session A: change First Name, do not save. 2. Session B: change First Name, save. 3. Session A: save. 4. Reload profile. | Last saved value is shown; no 500 error; data integrity maintained. | Manual | N | Should Test |

---

## KAN-9: Delete Employee Record

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN9-TC-001 | Delete single employee shows confirmation dialog | HR Admin logged in; at least one employee exists | 1. Navigate to Employee List. 2. Check one employee checkbox. 3. Click Delete button. | Confirmation dialog appears; no deletion occurs yet. | UI | Y | Must Test |
| KAN9-TC-002 | Confirm deletion removes employee from list | HR Admin logged in; "ToDelete Test" employee exists | 1. Select "ToDelete Test" via checkbox. 2. Click Delete. 3. Confirm in dialog. 4. Search for "ToDelete Test". | Employee removed from list; search returns "No Records Found". | UI | Y | Must Test |
| KAN9-TC-003 (TC-A06) | DELETE /api/v2/pim/employees removes employee | Valid session; employee with known empNumber exists | 1. DELETE /api/v2/pim/employees with `{ids:[empNumber]}`. 2. GET /api/v2/pim/employees/{empNumber}. | Step 1: HTTP 200. Step 2: HTTP 404. | API | Y | Must Test |
| KAN9-TC-004 | Cancel deletion aborts removal | HR Admin on Employee List; one row checked | 1. Check employee row. 2. Click Delete. 3. Click Cancel in dialog. | Dialog closes; employee record remains in list. | UI | Y | Must Test |
| KAN9-TC-005 | DELETE with non-existent empNumber returns 404 | Valid session | 1. DELETE /api/v2/pim/employees with `{ids:[999999]}`. | HTTP 404 or structured error; no side effects. | API | Y | Should Test |
| KAN9-TC-006 | Bulk delete multiple employees in single request | Valid session; 3 test employees with known empNumbers | 1. DELETE /api/v2/pim/employees with `{ids:[e1,e2,e3]}`. 2. GET each empNumber. | HTTP 200 on delete; all three GETs return 404; other employees unaffected. | API | Y | Should Test |

---

## KAN-10: Maintain Employee Documents

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated | Priority |
|---|---|---|---|---|---|---|---|
| KAN10-TC-001 | Upload PDF attaches document to employee profile | HR Admin on employee Personal Details page | 1. Scroll to Attachments section. 2. Click Add/Upload. 3. Select valid PDF < 1 MB. 4. Click Save. | File appears in Attachments list with correct filename; no error shown. | UI | Y | Must Test |
| KAN10-TC-002 (TC-A07) | GET attachments endpoint returns attachment list | Valid session; at least one attachment exists | 1. GET /api/v2/pim/employees/{empNumber}/screen/personal/attachments. | HTTP 200; array of attachment objects each with id, filename, size, fileType. | API | Y | Must Test |
| KAN10-TC-003 | POST attachment endpoint uploads file and returns 200/201 | Valid session; valid empNumber | 1. POST multipart/form-data with valid JPEG to /api/v2/pim/employees/{empNumber}/screen/personal/attachments. | HTTP 200 or 201; response contains new attachment metadata; GET returns new attachment. | API | Y | Must Test |
| KAN10-TC-004 | Upload unsupported file type is rejected | HR Admin on employee Attachments section | 1. Click Add/Upload. 2. Select .exe file. 3. Attempt to upload. | Error message: file type not supported; file not added to list. | UI | Y | Must Test |
| KAN10-TC-005 | Upload file exceeding size limit is rejected | HR Admin on employee Attachments section | 1. Click Add/Upload. 2. Select file > 1 MB. 3. Attempt to upload. | Error message: file exceeds max size; file not uploaded. | UI | Y | Should Test |
| KAN10-TC-006 | POST attachment with no file body returns 400 | Valid session | 1. POST empty multipart body to attachments endpoint. | HTTP 400; structured error; no attachment created. | API | Y | Should Test |
