# Test Cases — KAN-15: OrangeHRM User Management Module

**Epic**: KAN-15 — OrangeHRM User Management Module
**Stories covered**: KAN-16 (View System Users), KAN-17 (Search System Users)
**System under test**: https://opensource-demo.orangehrmlive.com/
**API base URL**: https://opensource-demo.orangehrmlive.com/web/index.php
**Auth**: Session cookie + XSRF-TOKEN header (credentials: Admin / admin123)
**Generated**: 2026-07-15
**Total scenarios**: 11 (4 for KAN-16, 7 for KAN-17)

---

## KAN-16 — User Story 1: View System Users (UM-US-001)

**AC summary**: When the administrator navigates to Admin > User Management > Users, the system displays a list of system users. Each record shows: Username, User Role, Employee Name, Status.

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated (Y/N) | Priority | Tier |
|---|---|---|---|---|---|---|---|---|
| TC-KAN16-01 | API — Users list returns records with required fields | 1. Valid session cookie and XSRF-TOKEN obtained via POST /auth/validate with Admin/admin123. | 1. Send `GET /api/v2/admin/users` with valid session cookie and XSRF-TOKEN header.<br>2. Assert HTTP status is 200.<br>3. Parse JSON response body.<br>4. Assert `data` array is non-empty.<br>5. For the first record, assert fields `userName`, `userRole.displayName`, `employee.employeeId` (or `employee.firstName`+`employee.lastName`), and `status` are all present and non-null. | HTTP 200. Response body contains `data` array with at least one item. Each item includes `userName` (string), `userRole.displayName` (string), `employee` object with name fields, and `status` (string). Maps directly to AC: Username, User Role, Employee Name, Status columns. | API | Y | Must Test | @smoke @sanity @regression |
| TC-KAN16-02 | API — Users list pagination with limit and offset | 1. Valid session obtained. 2. At least 2 users exist in the system. | 1. Send `GET /api/v2/admin/users?limit=1&offset=0` with auth headers.<br>2. Assert HTTP 200 and `data` array has exactly 1 item. Record the `userName` of that item.<br>3. Send `GET /api/v2/admin/users?limit=1&offset=1` with auth headers.<br>4. Assert HTTP 200 and `data` array has exactly 1 item.<br>5. Assert the `userName` in step 4 differs from the one in step 2. | Both responses return HTTP 200. `limit=1` constrains each page to one record. `offset=1` advances to the next record. The two returned usernames are different, confirming offset pagination is functional. | API | Y | Must Test | @sanity @regression |
| TC-KAN16-03 | API — Unauthenticated request to users list is rejected | 1. No session cookie or XSRF-TOKEN is set (or an expired/invalid token is used). | 1. Send `GET /api/v2/admin/users` with no Authorization cookie and no XSRF-TOKEN header.<br>2. Record the HTTP response status code.<br>3. Assert the status code is 401. | HTTP 401 Unauthorized. Response body contains an error or message indicating authentication is required. No user data is returned. | API | Y | Must Test | @smoke @sanity @regression |
| TC-KAN16-04 | UI — User Management list page renders all four required columns | 1. Browser is open. 2. Admin user is logged in at https://opensource-demo.orangehrmlive.com/ with credentials Admin/admin123. | 1. Click "Admin" in the top navigation menu.<br>2. In the left sidebar, click "User Management" then click "Users".<br>3. Wait for the user list table to be visible.<br>4. Inspect the table header row and assert it contains the column label "Username".<br>5. Assert the header also contains column label "User Role".<br>6. Assert the header also contains column label "Employee Name".<br>7. Assert the header also contains column label "Status".<br>8. Assert at least one data row is visible in the table body. | Page loads the User Management list. Table header displays exactly the four columns: Username, User Role, Employee Name, Status (matching AC). At least one user record row is rendered in the table body. | UI | Y | Must Test | @smoke @sanity @regression |

---

## KAN-17 — User Story 2: Search System Users (UM-US-002)

**AC summary**: From the User Management page, the administrator can search by Username, User Role, Employee Name, and Status. Matching records are displayed. When no matches exist, a "No Records Found" message is displayed.

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated (Y/N) | Priority | Tier |
|---|---|---|---|---|---|---|---|---|
| TC-KAN17-01 | API — Search by exact username returns matching user | 1. Valid session obtained. 2. A user with username "Admin" exists in the system. | 1. Send `GET /api/v2/admin/users?userName=Admin` with valid auth headers.<br>2. Assert HTTP 200.<br>3. Assert `data` array is non-empty.<br>4. Assert every item in `data` has `userName` equal to "Admin" (case-insensitive if the API applies LIKE matching; otherwise exact). | HTTP 200. `data` contains at least one record whose `userName` is "Admin". No records belonging to other usernames appear in the response. | API | Y | Must Test | @smoke @sanity @regression |
| TC-KAN17-02 | API — Search by User Role filters results correctly | 1. Valid session obtained. 2. The system has users with role "Admin" (userRoleId=1) and at least one user with role "ESS". | 1. Send `GET /api/v2/admin/users?userRoleId=1` with valid auth headers.<br>2. Assert HTTP 200.<br>3. Assert `data` array is non-empty.<br>4. Assert every item in `data` has `userRole.displayName` equal to "Admin".<br>5. Assert no item in `data` has `userRole.displayName` equal to "ESS". | HTTP 200. All returned records have userRole "Admin". ESS-role users are excluded from results. | API | Y | Must Test | @sanity @regression |
| TC-KAN17-03 | API — Search by Status "Enabled" returns only enabled users | 1. Valid session obtained. 2. Both Enabled and Disabled users exist in the system. | 1. Send `GET /api/v2/admin/users?status=Enabled` with valid auth headers.<br>2. Assert HTTP 200.<br>3. Assert `data` is non-empty.<br>4. For every item in `data`, assert `status` equals "Enabled".<br>5. Separately send `GET /api/v2/admin/users?status=Disabled` and assert all returned `status` values equal "Disabled". | HTTP 200 for both calls. Status filter is respected: `status=Enabled` returns only enabled accounts; `status=Disabled` returns only disabled accounts. | API | Y | Must Test | @sanity @regression |
| TC-KAN17-04 | API — Search with non-matching username returns empty data array | 1. Valid session obtained. 2. No user with username "zzz_nonexistent_user_xyz" exists. | 1. Send `GET /api/v2/admin/users?userName=zzz_nonexistent_user_xyz` with valid auth headers.<br>2. Assert HTTP 200.<br>3. Assert `data` array is empty (length 0).<br>4. Assert `meta.total` (or equivalent count field) equals 0. | HTTP 200. `data` array is empty. Total count is 0. No user records are returned. This is the API equivalent of the "No Records Found" AC condition. | API | Y | Must Test | @smoke @sanity @regression |
| TC-KAN17-05 | API — Search by partial username using substring match | 1. Valid session obtained. 2. A user with username "Admin" exists. | 1. Send `GET /api/v2/admin/users?userName=Adm` with valid auth headers.<br>2. Assert HTTP 200.<br>3. Inspect `data` array — assert it contains a record where `userName` includes the substring "Adm".<br>4. If `data` is empty, record as [ASSUMPTION]: the API requires exact match, not partial. Flag for manual confirmation. | HTTP 200. If partial/LIKE matching is supported: at least one record returned with `userName` containing "Adm". If exact match only: `data` is empty and TC-KAN17-01 covers the happy path. Result documents API matching behavior for test design traceability. | API | Y | Should Test | @regression |
| TC-KAN17-06 | UI — Search form filters user list and displays matching results | 1. Admin is logged in. 2. At least one user with username "Admin" and role "Admin" exists. 3. Browser is on the Admin > User Management > Users page. | 1. Locate the "Username" input field in the search form at the top of the page.<br>2. Type "Admin" into the Username field.<br>3. Click the "Search" button.<br>4. Wait for the results table to reload.<br>5. Assert the table body contains at least one row.<br>6. Assert every visible row in the "Username" column contains the text "Admin".<br>7. Clear the Username field (click "Reset" button if available).<br>8. Open the "User Role" dropdown and select "Admin".<br>9. Click "Search" again.<br>10. Assert every visible row in the "User Role" column shows "Admin". | After username search: table shows only rows matching "Admin". After role filter: table shows only rows with role "Admin". The search form correctly filters the displayed list, satisfying the AC that search by Username and User Role works. | UI | Y | Must Test | @smoke @sanity @regression |
| TC-KAN17-07 | UI — Search with no matching criteria displays "No Records Found" message | 1. Admin is logged in. 2. No user exists with username "zzz_nonexistent_user_xyz". 3. Browser is on the Admin > User Management > Users page. | 1. Locate the "Username" input field in the search form.<br>2. Type "zzz_nonexistent_user_xyz" into the Username field.<br>3. Click the "Search" button.<br>4. Wait for the page to respond.<br>5. Assert the user list table body is empty (no data rows rendered).<br>6. Assert a message reading "No Records Found" (or equivalent) is visible on the page. | Table body contains no data rows. A "No Records Found" message is displayed. This directly satisfies the AC: "a 'No Records Found' message should be displayed when no matches exist." | UI | Y | Must Test | @smoke @sanity @regression |

---

## Manual E2E Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Type | Automated (Y/N) | Priority | Tier |
|---|---|---|---|---|---|---|---|---|
| TC-KAN17-ME-01 | Manual E2E — Multi-criteria combined search narrows results correctly | 1. Admin is logged in at https://opensource-demo.orangehrmlive.com/. 2. The system has multiple users with varying roles and statuses. 3. At least one "Admin"-role, "Enabled" user exists. | 1. Navigate to Admin > User Management > Users.<br>2. In the search form, enter "Admin" in the Username field.<br>3. Select "Admin" from the User Role dropdown.<br>4. Select "Enabled" from the Status dropdown.<br>5. Click "Search".<br>6. Observe the results table.<br>7. Verify each returned row simultaneously satisfies: Username contains "Admin", User Role = "Admin", Status = "Enabled".<br>8. Now change Status to "Disabled" and click "Search" again.<br>9. Observe that either zero results are shown with "No Records Found", or returned rows have Status "Disabled" (and username/role criteria still applied).<br>10. Reset the form and confirm the full unfiltered list returns. | All results from the combined search (step 7) match all three criteria simultaneously. Changing one criterion (step 8) updates results accordingly. Reset restores the full list. Confirms that AND-logic applies across all search fields as implied by the AC. | Manual | N | Must Test | @regression |

---

## AC Coverage Matrix

| AC | Happy Path | Negative | Boundary/Partial Match | Edge Case | Integration |
|---|---|---|---|---|---|
| AC-KAN16: Display list with Username, User Role, Employee Name, Status | TC-KAN16-01, TC-KAN16-04 | TC-KAN16-03 | TC-KAN16-02 | — | — |
| AC-KAN17: Search by Username | TC-KAN17-01, TC-KAN17-06 | TC-KAN17-04 | TC-KAN17-05 | — | TC-KAN17-ME-01 |
| AC-KAN17: Search by User Role | TC-KAN17-02, TC-KAN17-06 | — | — | — | TC-KAN17-ME-01 |
| AC-KAN17: Search by Employee Name | — [see Gaps] | — | — | — | TC-KAN17-ME-01 |
| AC-KAN17: Search by Status | TC-KAN17-03, TC-KAN17-06 | — | — | — | TC-KAN17-ME-01 |
| AC-KAN17: No Records Found message | TC-KAN17-04 (API), TC-KAN17-07 (UI) | — | — | — | — |

---

## Test Data Requirements

- **Admin session**: Credentials Admin / admin123 at https://opensource-demo.orangehrmlive.com/ must be valid and not expired at test runtime.
- **XSRF-TOKEN**: Must be extracted from the login response `Set-Cookie` header and passed in the `X-XSRF-TOKEN` request header for all API calls.
- **Existing username "Admin"**: TC-KAN17-01 and TC-KAN17-06 depend on a user with `userName = "Admin"` existing — this is the default OrangeHRM demo admin account and should be present.
- **Multiple users with different roles**: TC-KAN17-02 requires at least one ESS-role user alongside Admin-role users. The demo instance typically ships with both.
- **Both Enabled and Disabled users**: TC-KAN17-03 requires at least one disabled user account. Verify the demo instance state before the run; if no disabled user exists, create one via UI before executing (creation is out of scope for these tests but is a valid precondition setup step).
- **Non-existent username sentinel value**: `zzz_nonexistent_user_xyz` — confirm this string does not match any user on the demo instance before each run.
- **Pagination**: TC-KAN16-02 requires at least 2 users total. The demo instance ships with multiple users by default.

---

## Risks and Gaps

- **Employee Name search (API)**: The `/api/v2/admin/users` endpoint supports `empNumber` (integer employee ID), not a free-text employee name string. The AC states "search by Employee Name" but the API requires a numeric `empNumber`. No test case covers API search by Employee Name because the parameter type and lookup mechanism are ambiguous from the AC alone. The UI search form uses an autocomplete picker (not a free-text field), which resolves the name to an `empNumber` internally. **Recommendation**: Clarify with the product owner whether "Employee Name" search in the AC refers to the UI autocomplete flow only, or whether a name-to-ID resolution API also needs to be validated.
- **Search by Employee Name — missing test coverage**: Due to the gap above, AC-KAN17 "Search by Employee Name" has no dedicated automated test case. The manual E2E (TC-KAN17-ME-01) partially exercises it through the combined search flow but does not isolate it. This is flagged as a coverage gap.
- **Demo environment state**: https://opensource-demo.orangehrmlive.com/ is a shared public demo. User data may be modified by other users between test runs. Tests that depend on specific user counts or specific disabled-user existence may be flaky. Use `limit/offset` tests against relative assertions (e.g., "at least 1 record") rather than exact counts where possible.
- **Partial username matching behavior (TC-KAN17-05)**: The API's matching strategy (exact vs. LIKE/contains) is not specified in the AC. TC-KAN17-05 is marked [ASSUMPTION] and documents both outcomes. Actual behavior should be confirmed during the first test run and the test updated accordingly.
- **XSRF-TOKEN rotation**: If the demo instance rotates XSRF-TOKEN on each request, automated API tests must re-fetch the token before each call. The test framework setup should handle this; verify during initial spike.
- **Scope boundary**: Create, Update, and Delete user operations are explicitly out of scope per AC. Any test that requires a disabled user as a precondition must use a pre-existing disabled account from the demo, not create one within the test.
- **Exploratory testing recommendation**: Manually verify the "Employee Name" autocomplete field on the UI — check behavior when the typed name matches multiple employees, when it matches zero employees, and when special characters are entered. This is not covered by the current test cases due to the API gap described above.

---

*To automate: run the automation-writer agent against this file.*
*To validate manually: run the manual-validator agent against this file.*
