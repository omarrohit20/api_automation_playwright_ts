# Test Cases: KAN-4 — Employee Information Management

**Epic**: KAN-4 — Employee Information Management
**Module**: OrangeHRM PIM
**Feature**: HR Admin manages employee records (search, create, edit, delete, documents, custom fields)
**Total Scenarios**: 72
**Generated**: 2026-07-13
**Author**: QA Test Case Design Agent

---

## Linked Stories

| Story | Title |
|-------|-------|
| KAN-5 | View Employee List |
| KAN-6 | Search Employee |
| KAN-7 | Add Employee |
| KAN-8 | Update Employee Information |
| KAN-9 | Delete Employee Record |
| KAN-10 | Maintain Employee Documents |
| KAN-11 | Create and Manage Custom Employee Fields |

---

## Test Case Table

| ID | Title | Story Ref | Preconditions | Steps | Expected Result | Category | Type | Automated | Priority |
|----|-------|-----------|---------------|-------|-----------------|----------|------|-----------|----------|
| TS-001 | View Employee List — Default Load | KAN-5 | 1. HR Admin account exists. 2. At least 1 employee record exists in PIM. 3. User is logged in as HR Admin. | 1. Navigate to PIM module from the top navigation. 2. Click "Employee List" from the left sidebar. 3. Observe the loaded page. | Employee list page loads. Table displays columns: Employee ID, Employee Name, Job Title, Employment Status, Sub Unit, Supervisor Information. At least one employee row is visible. | Happy Path | UI | Y | Must Test |
| TS-002 | View Employee List — All Required Columns Present | KAN-5 | 1. HR Admin logged in. 2. At least one employee exists. | 1. Navigate to PIM > Employee List. 2. Inspect the table header row. | All six columns are present in the header: "Employee Id", "Employee Name", "Job Title", "Employment Status", "Sub Unit", "Supervisor". No columns are missing or duplicated. | Happy Path | UI | Y | Must Test |
| TS-003 | View Employee List — Pagination Controls Visible | KAN-5 | 1. HR Admin logged in. 2. More than one page of employees exists (default page size typically 50 records; at least 51 employees required, or dataset allows default pagination to appear). | 1. Navigate to PIM > Employee List. 2. Scroll to the bottom of the page. 3. Observe the pagination area. | Pagination controls are rendered. At minimum, page number indicator and next/previous navigation are visible. | Happy Path | UI | Y | Must Test |
| TS-004 | View Employee List — Pagination Navigation Works | KAN-5 | 1. HR Admin logged in. 2. At least 51 employee records exist so a second page is available. | 1. Navigate to PIM > Employee List. 2. Note the Employee IDs shown on page 1. 3. Click the next-page control. 4. Note the Employee IDs shown on page 2. | Page 2 loads without error. The set of employees on page 2 is different from page 1. URL or pagination indicator updates to reflect page 2. | Happy Path | UI | Y | Must Test |
| TS-005 | View Employee List — No Employees in System | KAN-5 | 1. HR Admin logged in. 2. [ASSUMPTION] All employee records have been deleted or the test tenant has zero employees. | 1. Navigate to PIM > Employee List. 2. Observe the table body. | A "No Records Found" or equivalent empty-state message is displayed. The table header columns still render. No JavaScript errors in the console. | Edge Case | UI | Y | Should Test |
| TS-006 | View Employee List — Non-Admin Role Denied | KAN-5 | 1. A user account exists with the "ESS Employee" role (not HR Admin). 2. User is logged in as the ESS Employee. | 1. Manually navigate to the PIM Employee List URL (e.g., `/web/index.php/pim/viewEmployeeList`). 2. Observe the result. | User is either redirected to an unauthorized page or the PIM menu item is not accessible. The employee list is not rendered. | Negative | UI | Y | Must Test |
| TS-007 | View Employee List — Session Expiry Mid-View | KAN-5 | 1. HR Admin logged in and viewing Employee List. 2. Session timeout is set to a known short value (e.g., 1 minute) for test purposes. | 1. Navigate to PIM > Employee List and allow the page to render. 2. Wait until the session expires (or manually clear session cookie). 3. Attempt to click any action on the page or navigate to another page within PIM. | User is redirected to the login page. No employee data is accessible post-session expiry. | Edge Case | UI | N | Should Test |
| TS-008 | View Employee List — Large Dataset Performance | KAN-5 | 1. HR Admin logged in. 2. System has 1,000+ employee records. | 1. Navigate to PIM > Employee List. 2. Start a timer when the page begins loading. 3. Stop the timer when the list fully renders. | The list renders within an acceptable threshold (target: under 5 seconds). The browser does not freeze or crash. Pagination controls function normally. | Non-Functional | UI | N | Should Test |
| TS-009 | Search Employee — By Employee Name (Full Match) | KAN-6 | 1. HR Admin logged in on Employee List page. 2. Employee "John Smith" exists in the system. | 1. In the search panel, enter "John" in the Employee Name field. 2. Click the Search button. 3. Observe the results table. | Records matching the name "John" are returned. "John Smith" appears in the results. Other employees not matching "John" are excluded. | Happy Path | UI | Y | Must Test |
| TS-010 | Search Employee — By Employee ID | KAN-6 | 1. HR Admin logged in on Employee List page. 2. An employee with ID "0047" exists. | 1. Enter "0047" in the Employee ID search field. 2. Click Search. | Exactly the employee with Employee ID "0047" is returned in the results table. | Happy Path | UI | Y | Must Test |
| TS-011 | Search Employee — By Employment Status | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee with status "Full-Time Permanent" exists. | 1. Select "Full-Time Permanent" from the Employment Status dropdown. 2. Click Search. | All returned records have Employment Status "Full-Time Permanent". Employees with other statuses are not shown. | Happy Path | UI | Y | Must Test |
| TS-012 | Search Employee — By Job Title | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee with Job Title "Software Engineer" exists. | 1. Select "Software Engineer" from the Job Title dropdown. 2. Click Search. | Only employees with Job Title "Software Engineer" are shown in the results. | Happy Path | UI | Y | Must Test |
| TS-013 | Search Employee — By Sub Unit | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee belongs to Sub Unit "Engineering". | 1. Select "Engineering" from the Sub Unit dropdown. 2. Click Search. | Only employees in the "Engineering" sub unit are returned. | Happy Path | UI | Y | Must Test |
| TS-014 | Search Employee — By Supervisor Name | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee has a supervisor named "Jane Doe". | 1. Enter "Jane Doe" in the Supervisor Name field. 2. Click Search. | All employees under supervisor "Jane Doe" are listed. Employees with other supervisors are not shown. | Happy Path | UI | Y | Must Test |
| TS-015 | Search Employee — Combined Criteria (Name + Status) | KAN-6 | 1. HR Admin logged in on Employee List page. 2. Employee "Alice Brown" exists with status "Part-Time". | 1. Enter "Alice" in the Employee Name field. 2. Select "Part-Time" from the Employment Status dropdown. 3. Click Search. | Only employees named "Alice" with status "Part-Time" are returned. The intersection of both filters is applied. | Happy Path | UI | Y | Must Test |
| TS-016 | Search Employee — No Matching Records | KAN-6 | 1. HR Admin logged in on Employee List page. 2. No employee named "ZZZNOTEXIST" exists. | 1. Enter "ZZZNOTEXIST" in the Employee Name field. 2. Click Search. | A "No Records Found" message is displayed in the results area. The table body is empty. No error dialog appears. | Negative | UI | Y | Must Test |
| TS-017 | Search Employee — Empty Search (All Records) | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee exists. | 1. Leave all search fields empty. 2. Click Search. | All employee records are returned (subject to pagination). The full employee list is displayed as if no filter was applied. | Happy Path | UI | Y | Should Test |
| TS-018 | Search Employee — Employee Name: Single Character | KAN-6 | 1. HR Admin logged in on Employee List page. 2. At least one employee with a first name starting with "A" exists. | 1. Enter "A" in the Employee Name field. 2. Click Search. | All employees whose name contains or starts with "A" are returned. The system handles a 1-character query without error. | Boundary | UI | Y | Should Test |
| TS-019 | Search Employee — Employee Name: Maximum Length Input | KAN-6 | 1. HR Admin logged in on Employee List page. | 1. Enter a string of 255 characters in the Employee Name field. 2. Click Search. | The field accepts up to its defined maximum length. Either "No Records Found" is shown or a validation message limits input at the field boundary. No server error occurs. | Boundary | UI | Y | Should Test |
| TS-020 | Search Employee — Special Characters in Name Field | KAN-6 | 1. HR Admin logged in on Employee List page. | 1. Enter `<script>alert(1)</script>` in the Employee Name field. 2. Click Search. | The input is treated as a literal string search. No JavaScript alert executes. "No Records Found" or a sanitized query result is returned. No XSS vulnerability is triggered. | Edge Case | UI | Y | Must Test |
| TS-021 | Search Employee — SQL Injection Attempt | KAN-6 | 1. HR Admin logged in on Employee List page. | 1. Enter `' OR '1'='1` in the Employee Name field. 2. Click Search. | The system returns "No Records Found" or sanitized results. The full employee list is NOT returned. No database error message is exposed to the user. | Edge Case | UI | Y | Must Test |
| TS-022 | Search Employee — Unicode Characters | KAN-6 | 1. HR Admin logged in on Employee List page. 2. An employee with name containing Unicode characters (e.g., "José García") exists. | 1. Enter "José" in the Employee Name field. 2. Click Search. | The employee "José García" is returned. Unicode input is handled without corruption or error. | Edge Case | UI | Y | Should Test |
| TS-023 | Search Employee — Reset/Clear Search | KAN-6 | 1. HR Admin logged in on Employee List page. 2. A prior search has been performed filtering results. | 1. Click the "Reset" or "Clear" button in the search panel. 2. Observe the search fields and results table. | All search fields are cleared to their default/blank state. The employee list reverts to showing all records (full unfiltered list). | Happy Path | UI | Y | Should Test |
| TS-024 | Add Employee — Mandatory Fields Only | KAN-7 | 1. HR Admin logged in. 2. User is on the Add Employee page (PIM > Add Employee). | 1. Enter "TestFirst" in the First Name field. 2. Enter "TestLast" in the Last Name field. 3. Leave the Employee ID field as auto-generated or enter a unique valid ID (e.g., "9901"). 4. Click Save. | A success message is displayed (e.g., "Successfully Saved"). The new employee record is created. The user is redirected to the newly created employee's profile page. The employee appears in the Employee List when searched. | Happy Path | UI | Y | Must Test |
| TS-025 | Add Employee — System Auto-Generates Employee ID | KAN-7 | 1. HR Admin logged in on Add Employee page. 2. Employee ID field is pre-populated by the system. | 1. Do not change the auto-generated Employee ID. 2. Enter "AutoFirst" in First Name and "AutoLast" in Last Name. 3. Click Save. | Employee is saved successfully. The auto-generated Employee ID is assigned and appears on the employee's profile and in the Employee List. | Happy Path | UI | Y | Must Test |
| TS-026 | Add Employee — Manually Specified Unique Employee ID | KAN-7 | 1. HR Admin logged in on Add Employee page. 2. Employee ID "EMP-9999" does not exist in the system. | 1. Clear the Employee ID field and enter "EMP-9999". 2. Enter "ManualFirst" in First Name and "ManualLast" in Last Name. 3. Click Save. | Employee is saved with Employee ID "EMP-9999". The ID appears on the employee profile and in search results. | Happy Path | UI | Y | Must Test |
| TS-027 | Add Employee — Missing First Name | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Leave the First Name field empty. 2. Enter "NoFirst" in Last Name. 3. Enter a valid Employee ID. 4. Click Save. | An inline validation error is shown on the First Name field (e.g., "Required"). The form is not submitted. No record is created. | Negative | UI | Y | Must Test |
| TS-028 | Add Employee — Missing Last Name | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enter "NoLast" in First Name. 2. Leave the Last Name field empty. 3. Enter a valid Employee ID. 4. Click Save. | An inline validation error is shown on the Last Name field (e.g., "Required"). The form is not submitted. No record is created. | Negative | UI | Y | Must Test |
| TS-029 | Add Employee — Missing Employee ID | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enter "IDFirst" in First Name and "IDLast" in Last Name. 2. Clear the Employee ID field completely. 3. Click Save. | [ASSUMPTION] Either the system auto-generates an ID or an inline validation error on the Employee ID field prevents form submission. No employee is created with a blank ID. | Negative | UI | Y | Must Test |
| TS-030 | Add Employee — Duplicate Employee ID | KAN-7 | 1. HR Admin logged in on Add Employee page. 2. Employee with ID "0001" already exists. | 1. Enter "DupFirst" in First Name and "DupLast" in Last Name. 2. Enter "0001" in the Employee ID field. 3. Click Save. | An error is displayed indicating the Employee ID already exists (e.g., "Employee Id already exists"). The duplicate employee is not created. | Negative | UI | Y | Must Test |
| TS-031 | Add Employee — First Name: Maximum Length (255 chars) | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enter a 255-character string in the First Name field. 2. Enter "MaxLast" in Last Name. 3. Enter a valid unique Employee ID. 4. Click Save. | Employee is saved successfully with the 255-character first name, OR the field enforces a character limit and shows a validation message at the boundary. | Boundary | UI | Y | Should Test |
| TS-032 | Add Employee — First Name: Max+1 Characters | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Attempt to enter a string of 256 characters in the First Name field. 2. Enter "MaxPlusLast" in Last Name. 3. Click Save. | The field either truncates input at its maximum allowed length, or a validation error is shown. The employee is not saved with an over-limit name. | Boundary | UI | Y | Should Test |
| TS-033 | Add Employee — Employee ID: Special Characters | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enter "First" in First Name and "Last" in Last Name. 2. Enter "EMP@#$%" in the Employee ID field. 3. Click Save. | [ASSUMPTION] Either special characters are rejected with a validation error, or the system saves them as-is. Either way, no server-side exception is surfaced. | Edge Case | UI | Y | Should Test |
| TS-034 | Add Employee — With Middle Name | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enter "FirstName" in First Name. 2. Enter "MiddleName" in Middle Name (if field is available). 3. Enter "LastName" in Last Name. 4. Enter a valid unique Employee ID. 5. Click Save. | Employee is created successfully. Middle name appears on the employee profile. | Happy Path | UI | Y | Should Test |
| TS-035 | Add Employee — Create Login Toggle | KAN-7 | 1. HR Admin logged in on Add Employee page. | 1. Enable the "Create Login Details" toggle/checkbox. 2. Enter valid Username, Password, and Status for the new login. 3. Fill in mandatory employee fields. 4. Click Save. | Employee is created and a login account is simultaneously created. The new user can log in with the provided credentials. | Integration | UI | Y | Should Test |
| TS-036 | Add Employee — Newly Added Employee Appears in Search | KAN-7 | 1. HR Admin logged in. 2. An employee has just been created with Employee ID "NEW-001" and name "NewHire Test". | 1. Navigate to PIM > Employee List. 2. Enter "NewHire" in the Employee Name search field. 3. Click Search. | The newly created employee "NewHire Test" appears in the search results. The Employee ID "NEW-001" is shown correctly. | Integration | UI | Y | Must Test |
| TS-037 | Update Employee — Personal Details | KAN-8 | 1. HR Admin logged in. 2. Employee "EditFirst EditLast" (ID: "0010") exists. 3. User has navigated to the employee's Personal Details tab. | 1. Update the "Nickname" field to "Eddie". 2. Change the "Marital Status" dropdown to "Married". 3. Click Save. | A success message is shown. When the Personal Details tab is reopened (or after a page refresh), the Nickname reads "Eddie" and Marital Status reads "Married". | Happy Path | UI | Y | Must Test |
| TS-038 | Update Employee — Contact Details | KAN-8 | 1. HR Admin logged in. 2. An employee record exists and the user is on the Contact Details tab. | 1. Update the "Work Email" field to "updated.work@example.com". 2. Update the "Work Telephone" to "555-1234". 3. Click Save. | Success confirmation is shown. On revisiting the Contact Details tab, the email and telephone fields reflect the updated values. | Happy Path | UI | Y | Must Test |
| TS-039 | Update Employee — Job Information | KAN-8 | 1. HR Admin logged in. 2. An employee record exists. 3. User is on the Job tab. | 1. Change the "Job Title" to a different existing job title (e.g., "QA Engineer"). 2. Change "Employment Status" to "Part-Time". 3. Click Save. | Success message displayed. Job Information tab on reopening shows updated Job Title and Employment Status. | Happy Path | UI | Y | Must Test |
| TS-040 | Update Employee — Emergency Contacts | KAN-8 | 1. HR Admin logged in. 2. Employee exists with no emergency contacts. 3. User is on the Emergency Contacts tab. | 1. Click "Add" to add a new emergency contact. 2. Enter Name "Jane Emergency", Relationship "Spouse", Mobile "555-9999". 3. Click Save. | Emergency contact "Jane Emergency" is added and listed on the Emergency Contacts tab after saving. | Happy Path | UI | Y | Should Test |
| TS-041 | Update Employee — Qualifications | KAN-8 | 1. HR Admin logged in. 2. Employee exists. 3. User is on the Qualifications tab. | 1. Add a new Work Experience entry with Company "Tech Corp", Job Title "Developer", From "2020-01-01", To "2023-12-31". 2. Click Save. | The work experience entry is saved and listed in the Qualifications > Work Experience section. | Happy Path | UI | Y | Should Test |
| TS-042 | Update Employee — Memberships | KAN-8 | 1. HR Admin logged in. 2. Employee exists. 3. Membership options are configured in Admin. 4. User is on the Memberships tab. | 1. Click Add. 2. Select a Membership from the dropdown. 3. Enter a Subscription Fee. 4. Click Save. | Membership is listed under the Memberships tab after save. | Happy Path | UI | Y | Could Test |
| TS-043 | Update Employee — Dependents | KAN-8 | 1. HR Admin logged in. 2. Employee exists. 3. User is on the Dependents tab. | 1. Click Add. 2. Enter Name "Child One", Relationship "Child", Date of Birth "2015-06-15". 3. Click Save. | Dependent "Child One" appears in the Dependents list after saving. | Happy Path | UI | Y | Should Test |
| TS-044 | Update Employee — Save Without Changes | KAN-8 | 1. HR Admin logged in. 2. Employee profile loaded at Personal Details tab. | 1. Do not change any field. 2. Click Save. | No error occurs. A success message may display (system-dependent). Existing data is unchanged after save. | Edge Case | UI | Y | Should Test |
| TS-045 | Update Employee — Work Email: Invalid Format | KAN-8 | 1. HR Admin logged in. 2. Employee profile at Contact Details tab. | 1. Enter "notanemail" in the Work Email field. 2. Click Save. | An inline validation error is shown (e.g., "Expected format: admin@example.com"). The record is not saved. | Negative | UI | Y | Must Test |
| TS-046 | Update Employee — Required Field Cleared | KAN-8 | 1. HR Admin logged in. 2. Employee profile loaded (Personal Details). | 1. Clear the Last Name field (empty it out). 2. Click Save. | An inline validation error is shown indicating Last Name is required. The employee record is not updated with a blank Last Name. | Negative | UI | Y | Must Test |
| TS-047 | Update Employee — Concurrent Edit by Two Admins | KAN-8 | 1. Two HR Admin sessions open simultaneously (two browsers/tabs). 2. Both have the same employee's Personal Details tab open. | 1. In Session A, change Nickname to "Alpha" and click Save. 2. Immediately after, in Session B (without refreshing), change Nickname to "Beta" and click Save. | [ASSUMPTION] The second save either succeeds and overwrites with "Beta", or a conflict warning is shown. In either case, the final state is deterministic and no data corruption or server error occurs. | Edge Case | UI | N | Should Test |
| TS-048 | Update Employee — Navigate Away Without Saving | KAN-8 | 1. HR Admin logged in. 2. Employee Personal Details tab open. | 1. Change the Nickname field to "UnsavedChange". 2. Without clicking Save, navigate to a different PIM section (e.g., Job tab). 3. Navigate back to Personal Details. | [ASSUMPTION] Either a browser unsaved-changes warning is displayed, OR the change is discarded silently. The Nickname field does NOT persist "UnsavedChange" unless saved. | Edge Case | UI | Y | Should Test |
| TS-049 | Update Employee — Date Field: Leap Year Date | KAN-8 | 1. HR Admin logged in. 2. Employee exists. 3. User is on a section with a date field (e.g., Date of Birth in Personal Details). | 1. Enter "1996-02-29" (a valid leap year date) in the Date of Birth field. 2. Click Save. | The date "1996-02-29" is accepted and stored. The saved profile shows the correct leap year date. | Boundary | UI | Y | Should Test |
| TS-050 | Update Employee — Date Field: Future Date for Date of Birth | KAN-8 | 1. HR Admin logged in. 2. Employee exists. 3. Personal Details tab open with a Date of Birth field. | 1. Enter a future date (e.g., today's date + 1 year) in the Date of Birth field. 2. Click Save. | [ASSUMPTION] The system either rejects a future Date of Birth with a validation error, or accepts it. Behavior is documented. No server error is surfaced. | Boundary | UI | Y | Should Test |
| TS-051 | Delete Employee — Single Record via Checkbox | KAN-9 | 1. HR Admin logged in on Employee List page. 2. Employee "DeleteMe Test" (ID: "DEL-001") exists. | 1. Search for "DeleteMe Test" in the Employee List. 2. Select the checkbox next to the employee. 3. Click the Delete button. 4. Observe the confirmation dialog. 5. Click "Yes, Delete" (or equivalent confirm action). | A success message is shown. "DeleteMe Test" no longer appears in search results when searched by name or ID. The employee count decreases by 1. | Happy Path | UI | Y | Must Test |
| TS-052 | Delete Employee — Confirmation Dialog Appears | KAN-9 | 1. HR Admin logged in on Employee List page. 2. At least one employee record exists. | 1. Select the checkbox for any employee. 2. Click Delete. 3. Observe the UI response before confirming. | A confirmation dialog or modal appears asking the user to confirm deletion. The deletion has NOT been executed yet at this step. | Happy Path | UI | Y | Must Test |
| TS-053 | Delete Employee — Cancel Deletion | KAN-9 | 1. HR Admin logged in on Employee List page. 2. Employee "KeepMe Test" exists. | 1. Select the checkbox for "KeepMe Test". 2. Click Delete. 3. When the confirmation dialog appears, click "No" or "Cancel". 4. Observe the Employee List. | The confirmation dialog closes. "KeepMe Test" still appears in the Employee List. No deletion has occurred. | Negative | UI | Y | Must Test |
| TS-054 | Delete Employee — Bulk Delete Multiple Records | KAN-9 | 1. HR Admin logged in on Employee List page. 2. Employees "BulkDel One" and "BulkDel Two" both exist. | 1. Select the checkboxes for both "BulkDel One" and "BulkDel Two". 2. Click Delete. 3. Confirm the deletion in the dialog. | Both employees are removed. Neither appears in subsequent search results. | Happy Path | UI | Y | Should Test |
| TS-055 | Delete Employee — Select All and Delete | KAN-9 | 1. HR Admin logged in on Employee List page. 2. A filtered search shows exactly 3 employees. | 1. Perform a search that returns exactly 3 employees. 2. Click the "Select All" checkbox in the table header. 3. Click Delete. 4. Confirm deletion. | All 3 employees from the filtered view are deleted. Search for any of the 3 names or IDs returns "No Records Found". | Edge Case | UI | Y | Should Test |
| TS-056 | Delete Employee — Deleted Employee Not in Search | KAN-9 | 1. HR Admin logged in. 2. Employee "GoneNow Test" (ID: "GN-001") was just deleted in a prior step. | 1. Navigate to PIM > Employee List. 2. Enter "GoneNow" in the Employee Name search field. 3. Click Search. | "No Records Found" is displayed. The deleted employee does not appear in any search variation (name, ID). | Integration | UI | Y | Must Test |
| TS-057 | Delete Employee — Attempt Delete Without Selection | KAN-9 | 1. HR Admin logged in on Employee List page showing records. | 1. Do not select any employee checkbox. 2. Attempt to click the Delete button (if it is available/enabled without selection). | Either the Delete button is disabled/greyed out when no selection is made, or an advisory message is shown (e.g., "No records selected"). No deletion dialog appears. | Negative | UI | Y | Should Test |
| TS-058 | Maintain Employee Documents — Upload Supported File (PDF) | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at the Attachments tab. 3. A valid PDF file (under max size) is available on the local machine. | 1. Click "Add" on the Attachments tab. 2. Click "Browse" (or equivalent) and select the PDF file. 3. Add a description (e.g., "Employment Contract"). 4. Click Save. | The document is uploaded successfully. A success message is shown. The attachment appears in the Attachments list with the correct filename and description. | Happy Path | UI | Y | Must Test |
| TS-059 | Maintain Employee Documents — Download Uploaded Document | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at Attachments tab. 3. At least one document has been previously uploaded. | 1. Locate the uploaded document in the Attachments list. 2. Click the download link/icon for the document. | The file downloads to the user's machine. The downloaded file is not corrupted and opens correctly. | Happy Path | UI | Y | Must Test |
| TS-060 | Maintain Employee Documents — Upload Unsupported File Type | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at Attachments tab. 3. An .exe file is available on the local machine. | 1. Click "Add" on the Attachments tab. 2. Select the .exe file via the file picker. 3. Click Save. | [ASSUMPTION] The system rejects the file with a validation error indicating the file type is not supported. The .exe file is not uploaded to the server. | Negative | UI | Y | Must Test |
| TS-061 | Maintain Employee Documents — Upload File Exceeding Max Size | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at Attachments tab. 3. A file larger than the system's maximum upload size is available (e.g., >1GB if max is 1MB). | 1. Click "Add" on the Attachments tab. 2. Select the oversized file. 3. Click Save. | The system rejects the upload with an error message indicating the file exceeds the allowed size. No partial upload occurs. | Boundary | UI | Y | Must Test |
| TS-062 | Maintain Employee Documents — Upload File at Maximum Allowed Size | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at Attachments tab. 3. A file exactly at the maximum allowed upload size is available. | 1. Click "Add" on the Attachments tab. 2. Select the boundary-size file. 3. Click Save. | The upload succeeds. The file appears in the Attachments list. | Boundary | UI | Y | Should Test |
| TS-063 | Maintain Employee Documents — Upload Without Selecting File | KAN-10 | 1. HR Admin logged in. 2. Employee profile open at Attachments tab. | 1. Click "Add" on the Attachments tab. 2. Add a description but do not select a file. 3. Click Save. | A validation error is shown indicating a file is required. The record is not saved without an attachment. | Negative | UI | Y | Should Test |
| TS-064 | Maintain Employee Documents — Multiple Attachments | KAN-10 | 1. HR Admin logged in. 2. Employee profile at Attachments tab. | 1. Upload a PDF file. 2. Upload a second file (e.g., DOCX). 3. Observe the Attachments list. | Both files appear in the Attachments list independently. Each can be downloaded separately. | Edge Case | UI | Y | Should Test |
| TS-065 | Maintain Employee Documents — File with Special Characters in Filename | KAN-10 | 1. HR Admin logged in. 2. Employee profile at Attachments tab. 3. A valid PDF named "employee résumé (final).pdf" is available. | 1. Click Add. 2. Select the file with special characters in the name. 3. Click Save. | The file is uploaded successfully. The filename is displayed correctly (with special characters preserved or safely encoded). The file is downloadable. | Edge Case | UI | Y | Should Test |
| TS-066 | Custom Fields — Custom Field Displayed on Employee Profile | KAN-11 | 1. HR Admin has configured at least one custom field (e.g., "Department Code") in Admin > Custom Fields for the PIM module. 2. HR Admin is viewing any employee's profile. | 1. Navigate to the employee's profile. 2. Navigate to the section where the custom field is displayed (e.g., Custom Fields tab or within Personal Details). | The custom field "Department Code" is visible on the employee profile page. The field label is correct. | Happy Path | UI | Y | Must Test |
| TS-067 | Custom Fields — Enter and Save Custom Field Value | KAN-11 | 1. HR Admin logged in. 2. Custom field "Department Code" exists and is displayed on the employee profile. | 1. Navigate to the Custom Fields section of an employee profile. 2. Enter "DC-101" in the "Department Code" field. 3. Click Save. | A success message is shown. When the custom fields section is reopened, "DC-101" is displayed in the "Department Code" field. | Happy Path | UI | Y | Must Test |
| TS-068 | Custom Fields — Custom Field Value Persists Across Sessions | KAN-11 | 1. Custom field "Project Code" has been saved with value "PRJ-500" for employee ID "0010". | 1. Log out of OrangeHRM. 2. Log back in as HR Admin. 3. Navigate to the employee profile for ID "0010". 4. Open the Custom Fields section. | The value "PRJ-500" is still present in the "Project Code" custom field. Data has persisted across sessions. | Happy Path | UI | Y | Must Test |
| TS-069 | Custom Fields — Custom Field Not Configured Not Visible | KAN-11 | 1. No custom fields have been configured for the PIM module. | 1. Navigate to any employee profile. 2. Look for a Custom Fields tab or section. | No custom fields section is displayed (or the section shows a message indicating no custom fields exist). No empty placeholder form is shown. | Negative | UI | Y | Should Test |
| TS-070 | Custom Fields — Custom Field: Dropdown Type | KAN-11 | 1. HR Admin logged in. 2. A custom dropdown field "Contract Type" exists with options: "Permanent", "Contract", "Intern". | 1. Navigate to an employee's Custom Fields section. 2. Select "Contract" from the "Contract Type" dropdown. 3. Click Save. | The value "Contract" is saved. On reopening, the dropdown shows "Contract" as the selected value. | Happy Path | UI | Y | Should Test |
| TS-071 | Custom Fields — Custom Field Value: Maximum Length Input | KAN-11 | 1. HR Admin logged in. 2. A custom text field "Notes" exists with a max length (e.g., 250 characters). | 1. Navigate to Custom Fields for an employee. 2. Enter exactly 250 characters in the "Notes" field. 3. Click Save. | The value is saved successfully. No truncation occurs. Reopening shows all 250 characters. | Boundary | UI | Y | Should Test |
| TS-072 | Custom Fields — Custom Field: HTML Injection in Text Field | KAN-11 | 1. HR Admin logged in. 2. A custom text field exists. | 1. Enter `<b>Bold</b><img src=x onerror=alert(1)>` in a custom text field. 2. Click Save. 3. Reopen the profile and view the custom field. | The stored value is rendered as plain text or safely escaped HTML. No JavaScript executes. No XSS vulnerability is present. | Edge Case | UI | Y | Must Test |

---

## AC Coverage Matrix

| Story | AC Summary | Happy Path | Negative | Boundary | Edge Case | Integration | Non-Functional |
|-------|-----------|------------|----------|----------|-----------|-------------|----------------|
| KAN-5 | View list with all columns + pagination | TS-001, TS-002, TS-003, TS-004 | TS-006 | — | TS-005, TS-007 | — | TS-008 |
| KAN-6 | Search by all criteria; "No Records Found" | TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-017, TS-023 | TS-016 | TS-018, TS-019 | TS-020, TS-021, TS-022 | — | — |
| KAN-7 | Add employee with mandatory fields; ID generation; appears in list | TS-024, TS-025, TS-026, TS-034, TS-035 | TS-027, TS-028, TS-029, TS-030 | TS-031, TS-032 | TS-033 | TS-036 | — |
| KAN-8 | Edit all sections; changes persist | TS-037, TS-038, TS-039, TS-040, TS-041, TS-042, TS-043, TS-044 | TS-045, TS-046 | TS-049, TS-050 | TS-047, TS-048 | — | — |
| KAN-9 | Delete with confirmation; removed from search | TS-051, TS-052, TS-053, TS-054, TS-055 | TS-057 | — | TS-055 | TS-056 | — |
| KAN-10 | Upload docs; view and download | TS-058, TS-059 | TS-060, TS-063 | TS-061, TS-062 | TS-064, TS-065 | — | — |
| KAN-11 | Custom fields displayed; values saved and persisted | TS-066, TS-067, TS-068, TS-069, TS-070 | TS-069 | TS-071 | TS-072 | — | — |

---

## Test Data Requirements

### Accounts
- `hr_admin / AdminPass123` — HR Admin account with full PIM access
- `ess_user / EssPass123` — ESS Employee role account (no PIM admin rights)

### Employees (pre-existing seed data)
- Employee ID "0001": used to test duplicate ID rejection (TS-030)
- Employee ID "0010", Name "EditFirst EditLast": used for update scenarios (TS-037, TS-049, TS-050, TS-068)
- Employee "John Smith": used for name-search happy path (TS-009)
- Employee "Alice Brown" with status "Part-Time": used for combined search (TS-015)
- Employee "José García": used for Unicode search (TS-022)
- Employee with supervisor "Jane Doe": used for supervisor search (TS-014)
- Employee in Sub Unit "Engineering": used for sub unit search (TS-013)
- Employee with Job Title "Software Engineer": used for job title search (TS-012)
- Employee with status "Full-Time Permanent": used for status search (TS-011)
- Employee "DeleteMe Test" ID "DEL-001": used for delete scenarios (TS-051)
- Employees "BulkDel One" and "BulkDel Two": used for bulk delete (TS-054)
- Employee "KeepMe Test": used for cancel-delete scenario (TS-053)
- Employee with an existing attachment: used for download test (TS-059)
- Employee ID "0010" with custom field "Project Code" = "PRJ-500": used for TS-068

### Bulk dataset
- At least 51 employee records present for pagination tests (TS-003, TS-004)
- A filtered result set of exactly 3 employees for select-all-delete test (TS-055)

### File assets
- `valid_contract.pdf` — valid PDF file within the upload size limit
- `valid_resume.docx` — valid DOCX file within the upload size limit
- `employee résumé (final).pdf` — PDF with special characters in filename
- `malicious.exe` — unsupported file type for rejection test (TS-060)
- `oversized_file.bin` — file exceeding the system's maximum upload size (TS-061)
- `boundary_size_file.pdf` — file exactly at maximum upload size (TS-062)

### Custom fields (pre-configured in Admin)
- Text field: "Department Code" (used in TS-066, TS-067)
- Text field: "Project Code" (used in TS-068)
- Text field: "Notes" with max length 250 characters (used in TS-071)
- Dropdown field: "Contract Type" with options Permanent / Contract / Intern (used in TS-070)
- Text field: any (used for TS-072 injection test)

### Job configuration
- Job Title "QA Engineer" exists in system configuration
- Job Title "Software Engineer" exists in system configuration
- Employment Status "Part-Time" exists
- Employment Status "Full-Time Permanent" exists
- Sub Unit "Engineering" exists in the org structure
- At least one Membership option configured

---

## Automation Notes

All cases are marked for Playwright UI automation except:

| ID | Reason Not Automated |
|----|----------------------|
| TS-007 | Requires session timeout manipulation — environment-specific and timing-sensitive |
| TS-008 | Performance measurement requires external tooling (Lighthouse, k6); Playwright alone cannot reliably assert render time |
| TS-047 | Requires two simultaneous browser sessions; possible with Playwright but high complexity — recommend manual first |

### Suggested Playwright page object targets
- `PIMPage` — navigation to PIM module, Employee List rendering
- `EmployeeSearchPage` — search panel interactions and result assertions
- `AddEmployeePage` — form fill, save, validation assertions
- `EmployeeProfilePage` — tab navigation, section-level edits, save confirmation
- `AttachmentsPage` — file upload dialog, attachment list assertions
- `CustomFieldsPage` — custom field rendering and value persistence

---

## Risks and Gaps

1. **No Figma designs linked**: Column ordering, exact field labels, and validation messages are based on OrangeHRM default behavior. If the instance is heavily customized, label text in expected results may differ.

2. **File upload size limit unknown**: TS-061 and TS-062 assume a maximum file size exists but the exact value is not documented in the ticket. Tester must verify the configured limit in Admin settings before executing these cases.

3. **Custom field types**: KAN-11 only confirms the AC for custom fields displaying and persisting. Edge cases for all possible custom field types (date, integer, text area) are partially covered. If additional types exist in the instance, add type-specific boundary cases.

4. **Deletion of employees with active login accounts**: KAN-9 does not specify behavior when the deleted employee has a login account. It is assumed the login is also deactivated or deleted. This is an untested gap — recommend exploratory testing around this scenario.

5. **Concurrent session behavior** (TS-047): OrangeHRM's conflict resolution behavior for simultaneous edits is not documented in the ticket. The test is marked `[ASSUMPTION]` — tester should document actual behavior and raise a defect if last-write-wins causes silent data loss.

6. **Accessibility coverage**: No explicit accessibility ACs are in the epic. Screen reader and keyboard-navigation testing is recommended as exploratory work, particularly for the search panel dropdowns and the file upload dialog.

7. **Cross-browser coverage**: All cases are designed for execution against Chromium. The Playwright config also targets Firefox and WebKit — it is recommended to run the full suite against all three browsers, especially for file upload dialogs (TS-058 through TS-065) which have known cross-browser differences.

8. **PIM API layer**: The ticket specifies UI-only coverage. Backend/API-level validation (e.g., direct REST calls to the PIM API bypassing the UI) is out of scope per ticket direction but is a recommended security-testing gap to flag.

---

*To automate: run the automation-writer agent against this file.*
*To validate manually: run the manual-validator agent against this file.*
