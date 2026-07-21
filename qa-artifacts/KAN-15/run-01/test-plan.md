# Test Plan — KAN-15: OrangeHRM User Management Module

**Run:** run-01  
**Date:** 2026-07-15  
**Environment:** dev / qa (https://opensource-demo.orangehrmlive.com/)  
**Tester:** QA Analyst Agent  

---

## 1. Scope

### Epic
**KAN-15** — OrangeHRM User Management Module  
_As a System Administrator, I want to manage system users, roles, and account access so that only authorized employees can access OrangeHRM based on their responsibilities._

### Stories Under Test
| Key    | Title                          | Status |
|--------|-------------------------------|--------|
| KAN-16 | User Story 1: View System Users  | To Do  |
| KAN-17 | User Story 2: Search System Users | To Do  |

### In Scope
- Viewing the system users list via OrangeHRM Admin UI (GET /api/v2/admin/users)
- Pagination behavior for the users list
- Retrieving a single user by ID
- Searching users by username, user role, employee name, and status
- "No Records Found" message when search yields no matches
- Column presence in the UI table (Username, User Role, Employee Name, Status)
- API authentication pattern (session cookie + XSRF-TOKEN)

### Out of Scope
- Creating new system users (KAN-15 ACs do not cover creation — KAN-16/KAN-17 are read/search only)
- Updating or deleting system users
- Password management / reset flows
- Role permission matrix testing
- Non-admin user access attempts

---

## 2. Environments

| Env | App URL                                              | API Base URL                                                         |
|-----|------------------------------------------------------|----------------------------------------------------------------------|
| dev | https://opensource-demo.orangehrmlive.com/           | https://opensource-demo.orangehrmlive.com/web/index.php              |
| qa  | https://opensource-demo.orangehrmlive.com/           | https://opensource-demo.orangehrmlive.com/web/index.php              |

Credentials: `Admin` / `admin123` (from `DEV_APP_CREDENTIALS` / `QA_APP_CREDENTIALS` env vars)

---

## 3. Figma Parity

No Figma frames are linked to KAN-15, KAN-16, or KAN-17. Figma parity check is skipped. Noted in step 2 log.

---

## 4. Entry Criteria
- OrangeHRM demo app is reachable and Admin login succeeds
- At least one system user exists in the Admin > User Management list
- Authentication cookies obtainable via the existing `auth.setup.ts` global setup

## 5. Exit Criteria
- All automated test cases execute with a result (pass or documented fail)
- All manual/E2E scenarios have been walk-through verified or explicitly noted as not feasible
- `report.md` and `execution-summary.md` are written and verified on disk
- Any genuine application deviations are drafted as bug entries in `jira-bug-drafts.md`

---

## 6. Risk Areas
1. **Shared demo environment**: `opensource-demo.orangehrmlive.com` is a public demo — concurrent logins from other users may interfere with session cookies or XSRF tokens. Mitigation: run with `--workers=1` and use a single authenticated session.
2. **Session expiry**: Demo app sessions may expire mid-run. Mitigation: re-authenticate in `beforeAll` hooks.
3. **Data volatility**: Other testers may add/remove users, making exact-count assertions fragile. Mitigation: assert structure (fields present, pagination shape) rather than exact record counts.
4. **No Figma spec**: UI assertions rely on live DOM observation rather than design spec. Minor layout deviations cannot be flagged as design-vs-build deviations.

---

## 7. Test Pyramid Mix (Target)

| Layer   | Count | % | Rationale |
|---------|-------|---|-----------|
| API     | 7     | 64% | Users list, pagination, single-user get, search by username/role/status/empname, no-results search |
| UI      | 3     | 27% | List page renders with correct columns, search form interaction, no-results message in UI |
| Manual  | 1     | 9%  | Multi-criteria combined search E2E (role + status + name) |
| **Total** | **11** | **100%** | |

---

## 8. Per-Story Summary

### KAN-16 — View System Users

**What is being tested:** The Admin > User Management > Users page must load and show a paginated list with the four expected columns (Username, User Role, Employee Name, Status). At the API layer, GET /api/v2/admin/users must return a well-formed list with correct pagination metadata.

**Why:** AC states "the system should display a list of system users" with four specific columns. This is verifiable both via the REST API (data shape) and the UI (rendered columns).

**Test cases:** TC-01 (API list happy path), TC-02 (API pagination), TC-03 (API get by ID), TC-04 (UI list columns render)

### KAN-17 — Search System Users

**What is being tested:** The search form on User Management > Users must filter results by username, user role, employee name, and status. An empty result set must display a "No Records Found" message.

**Why:** AC explicitly enumerates four search criteria plus the no-match message. All four API-level filter parameters are verifiable directly against the REST endpoint; the UI layer verifies the form interaction and the no-results message rendering.

**Test cases:** TC-05 (API search by username), TC-06 (API search by role), TC-07 (API search by status), TC-08 (API search no results), TC-09 (UI search form interaction + results), TC-10 (UI no-records message), TC-11 (Manual multi-criteria E2E)

---

## 9. Automation Approach

- **API specs**: `spec/api/admin-users.spec.ts` (new) using a new `AdminUsers` wrapper class in `libs/admin-users.ts`
- **UI specs**: `spec/ui/admin/admin-users.spec.ts` (new) using a new `AdminUsersPage` page object in `libs/pages/admin/AdminUsersPage.ts`
- **Playwright config**: A new `admin-ui` project will be added to `playwright.config.ts` mirroring the existing `pim-ui` / `leave-ui` pattern
- **Auth**: Reuses existing `auth.setup.ts` / `storageState: 'playwright/.auth/admin.json'`
- **Execution**: `--workers=1` to avoid session conflicts on the shared demo server

---

_Test cases generated by `qa-test-designer` agent; scripts delegated to `api-automation-architect` and `ui-automation-architect`._
