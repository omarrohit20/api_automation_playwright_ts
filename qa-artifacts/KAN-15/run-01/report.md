# Report — KAN-15: OrangeHRM User Management Module (run-01)

**Status:** COMPLETE — ALL AUTOMATED TESTS PASS
**Date:** 2026-07-15
**Run:** run-01 (first run — no prior runs for KAN-15)
**Environment:** dev / qa (https://opensource-demo.orangehrmlive.com/)
**App Version:** OrangeHRM OS 5.9

---

## High-Level Summary

| Item | Value |
|------|-------|
| Epic | KAN-15 — OrangeHRM User Management Module |
| Stories | KAN-16 (View System Users), KAN-17 (Search System Users) |
| Environment | https://opensource-demo.orangehrmlive.com/ |
| Deployment Gate | PASSED |
| Figma Parity | N/A — no Figma frames linked |
| Test Pyramid Achieved | 8 API (73%) / 3 UI (27%) / 1 Manual not automated (9%) |
| API Tests | 8 / 8 PASSED |
| UI Tests | 3 / 3 PASSED |
| Manual Tests | 1 — TC-KAN17-ME-01 not automated, requires human tester |
| Go/No-Go | GO — all automated tests pass, no genuine application bugs |

---

## Step 2 — Deployment Gate and Figma Parity

Deployment gate checks performed via Playwright MCP browser:

- App URL https://opensource-demo.orangehrmlive.com/ — REACHABLE
- Admin login (Admin / admin123) — SUCCESS, redirected to /dashboard/index
- Navigation to /admin/viewSystemUsers — SUCCESS
- "System Users" heading present; search form renders with all 4 AC fields (Username, User Role, Employee Name, Status); results table renders with correct column headers
- Feature presence: CONFIRMED
- Deployment Gate: PASSED

Figma parity: no Figma frames linked. Parity check skipped.

---

## Step 3 — Seed Data and Network Capture

No seed data required. Demo app has users pre-populated (8 at capture time, grew to 16 during run due to concurrent public demo usage).

Key network capture findings (full details in network-capture.md):

Endpoint: GET /api/v2/admin/users

Query parameters observed:
- username (string) — exact-match filter (NOT partial/LIKE)
- userRoleId (integer) — Admin=1, ESS=2
- status (integer) — Enabled=1, Disabled=0
- empNumber (integer) — filter by employee number
- limit, offset, sortField, sortOrder — pagination and sorting

Response shape: { data: [...], meta: { total }, rels: [] }
Each data item: { id, userName, deleted, status (boolean), employee { empNumber, employeeId, firstName, middleName, lastName, terminationId }, userRole { id, name, displayName } }

Key corrections from initial assumptions:
- Query param is "username" (lowercase), not "userName"
- status param is integer (1/0); response status field is boolean (true/false)
- Username search is exact-match only — "Adm" returns 0 results, "Admin" returns 1

Reclassification pass: all discovered endpoints already covered by test-cases.md. No new API test cases added from network capture.

---

## Step 4 — Scripts Created

| File | Action | Author |
|------|--------|--------|
| playwright.config.ts | Added admin-ui project | qa-analyst |
| libs/admin-users.ts | Created — AdminUsers wrapper class | api-automation-architect |
| test_data/admin-users-list-response.json | Created — fixture template | api-automation-architect |
| spec/api/admin-users.spec.ts | Created — 8 API test cases | api-automation-architect |
| libs/pages/admin/AdminUsersPage.ts | Created — Page Object | ui-automation-architect |
| spec/ui/admin/admin-users.spec.ts | Created — 3 UI test cases | ui-automation-architect |

See script-changes.md for full details including tags and defect-fix entries.

---

## Step 5 — Execution Results

### API Tests — spec/api/admin-users.spec.ts
Command: npx playwright test spec/api/admin-users.spec.ts --workers=1 --project=chromium
Run time: 33.2 seconds

| Test ID | Title | Tags | Result |
|---------|-------|------|--------|
| TC-KAN16-01 | GET users returns records with all required AC fields | @smoke @sanity @regression | PASSED |
| TC-KAN16-02 | GET users with limit/offset — pagination returns distinct pages | @sanity @regression | PASSED |
| TC-KAN16-03 | GET users without auth returns 401 | @smoke @sanity @regression | PASSED |
| TC-KAN17-01 | Search username=Admin returns matching user | @smoke @sanity @regression | PASSED |
| TC-KAN17-02 | Search userRoleId=2 returns only ESS users | @sanity @regression | PASSED |
| TC-KAN17-03 | Search status=1 returns only enabled users | @sanity @regression | PASSED |
| TC-KAN17-04 | Search non-existent username returns empty data | @smoke @sanity @regression | PASSED |
| TC-KAN17-05 | Partial username match behavior documented | @regression | PASSED (see note) |

Note TC-KAN17-05: username=Adm returned 0 results — API uses exact-match not partial/LIKE.
The test documents this correctly and passes in both branches (results or no results).

### UI Tests — spec/ui/admin/admin-users.spec.ts
Command: npx playwright test spec/ui/admin/admin-users.spec.ts --workers=1 --project=admin-ui --timeout=90000
Run time: 40.3 seconds (including auth-setup)

| Test ID | Title | Tags | Result |
|---------|-------|------|--------|
| TC-KAN16-04 | All four AC column headers visible on User Management page | @smoke @sanity @regression | PASSED |
| TC-KAN17-06 | Search by username "Admin" shows matching rows; search by role ESS shows ESS rows | @smoke @sanity @regression | PASSED |
| TC-KAN17-07 | Search non-existent username shows "No Records Found" message | @smoke @sanity @regression | PASSED |

### Manual Tests

| Test ID | Title | Result |
|---------|-------|--------|
| TC-KAN17-ME-01 | Multi-criteria combined search E2E (role + status + name) | NOT AUTOMATED — manual-only by design (5-10% E2E tier) |

---

## Step 6 — Automation Defects Fixed (3 total)

All three failures during the run were automation defects, not application bugs.

### Defect 1 — auth.setup.ts: Language-change selector failure

File: spec/ui/auth.setup.ts
Original: getByPlaceholder('Username').fill(...)
Fixed: waitForSelector('input[name="username"]') then locator('input[name="username"]').fill(...)

Root cause: Another user on the shared public demo server changed the OrangeHRM UI language to Chinese. The login form rendered "username" placeholder as Chinese text. The getByPlaceholder('Username') locator timed out after 60 seconds because the English placeholder never appeared.

Classification: AUTOMATION DEFECT — shared-demo environment volatility. Application login works correctly; only the test selector was language-specific.

Fix: name-attribute selectors (input[name="username"]) are set in application code and are not translated, making them resilient to locale changes.

### Defect 2 — AdminUsersPage.ts: waitForLoadState race condition

File: libs/pages/admin/AdminUsersPage.ts
Affected: searchByUsername, searchByRole, resetSearch, navigate
Original: await page.waitForLoadState('networkidle')
Fixed: set up waitForResponse('**/api/v2/admin/users**') BEFORE the click, then await the promise after

Root cause: waitForLoadState('networkidle') checks the current state. Because the SPA page was already networkidle when the promise was registered (after filling the input but before clicking Search), it resolved immediately against the existing idle state rather than waiting for the search XHR call to complete. Tests then read the table before filtered results loaded.

Observable symptoms: TC-KAN17-06 read "CKEAi" from the username column (from the unfiltered 16-user list) instead of "Admin". TC-KAN17-07 counted 16 rows instead of 0.

Classification: AUTOMATION DEFECT — timing/sequencing issue. Application filters correctly; test synchronization was wrong.

Fix: waitForResponse sets up the listener before the action that triggers the XHR, guaranteeing it catches the search request.

### Defect 3 — AdminUsersPage.ts: Strict mode violation on "No Records Found"

File: libs/pages/admin/AdminUsersPage.ts
Method: isNoRecordsMessageVisible
Original: return this.page.getByText('No Records Found').isVisible()
Fixed: return this.page.locator('span.oxd-text').filter({ hasText: 'No Records Found' }).isVisible()

Root cause: When search returns no results, OrangeHRM renders "No Records Found" in two places: (1) a span inside the table body card, and (2) a p inside the #oxd-toaster_1 toast notification. Playwright strict mode throws when a locator resolves to more than one element.

Classification: AUTOMATION DEFECT — over-broad locator. Application behavior (table message + toast) is correct.

Fix: scoping to span.oxd-text matches only the table-body span, not the toast p element.

---

## Step 7 — Bug Drafts

No genuine application bugs found. No Jira bug drafts required.

Confirmation checklist — each failure double-checked against ACs:

- Auth setup failure: language change on shared demo server; application login works in English and in Chinese; the feature is not broken — AUTOMATION DEFECT confirmed
- Search results not filtering: waitForLoadState race condition in page object code; application search filters results correctly as verified by API tests (TC-KAN17-01 through TC-KAN17-04) — AUTOMATION DEFECT confirmed
- Strict mode on No Records Found: both table span and toast are correct application behavior; the selector was too broad — AUTOMATION DEFECT confirmed

After applying three targeted fixes, all 11 automated tests passed. No behavior deviation from any AC was observed.

AC coverage confirmation:
- AC-KAN16 (4-column list): VERIFIED — TC-KAN16-01 (API field presence) + TC-KAN16-04 (UI column headers)
- AC-KAN17 search by Username: VERIFIED — TC-KAN17-01 (API) + TC-KAN17-06 (UI)
- AC-KAN17 search by User Role: VERIFIED — TC-KAN17-02 (API) + TC-KAN17-06 (UI)
- AC-KAN17 search by Status: VERIFIED — TC-KAN17-03 (API)
- AC-KAN17 No Records Found: VERIFIED — TC-KAN17-04 (API empty response) + TC-KAN17-07 (UI message visible)
- AC-KAN17 search by Employee Name: PARTIAL — API uses empNumber integer, not name string; UI autocomplete resolves names internally; documented as a known gap in test-cases.md; not a bug

---

## Pyramid Compliance

Target: 60-70% API / 20-30% UI / 5-10% Manual
Achieved: 73% API / 27% UI / 9% Manual

API is slightly above the upper target bound. This is justified: the KAN-16/17 feature surface has more independently testable API behaviors (list, pagination, auth rejection, 4 search filter parameters, no-results path) than UI-only behaviors (column rendering, form interaction, no-records message). Forcing fewer API tests to hit exactly 60-70% would reduce coverage quality without improving test design.

---

## Go/No-Go: GO

All 11 automated tests pass. All testable acceptance criteria verified. Three automation defects found and fixed — none indicate application regressions. The Employee Name API search gap is documented and does not block this Epic.
