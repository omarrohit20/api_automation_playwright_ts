# Test Plan — KAN-4: Employee Information Management
**Run:** run-04  
**Date:** 2026-07-14  
**Environment:** QA (https://opensource-demo.orangehrmlive.com/)  
**Epic:** KAN-4 — Employee Information Management (OrangeHRM PIM Module)  
**Tester:** QA Analyst (automated via qa-analyst agent)

---

## 1. Scope

### In Scope
The OrangeHRM PIM (Personnel Information Management) module, covering:
- Employee list retrieval (search, sort, filter, pagination)
- Employee creation (Add Employee form with First Name, Last Name, Middle Name, Employee ID, Login credentials toggle)
- Employee record read (profile/detail view by empNumber)
- Employee record update (edit personal details, contact info, job details)
- Employee record deletion
- Supporting reference data: job titles, employment statuses, sub-units
- API layer validation against the `/web/index.php/api/v2/pim/` and `/web/index.php/api/v2/admin/` endpoint surface
- UI validation of the Add Employee and Employee List screens in OrangeHRM OS 5.9

### Out of Scope
- OrangeHRM modules other than PIM (Leave, Time, Recruitment, etc.)
- Single-sign-on / LDAP authentication flows
- Third-party integrations (payroll connectors, etc.)
- Performance / load testing
- No Figma frames were linked to this Epic — no Figma parity check required

---

## 2. Environments
| Environment | App URL | API Base URL |
|---|---|---|
| QA | https://opensource-demo.orangehrmlive.com/ | https://opensource-demo.orangehrmlive.com/web/index.php/ |
| DEV | https://opensource-demo.orangehrmlive.com/ | https://opensource-demo.orangehrmlive.com/web/index.php/ |

Credentials: `Admin` / `admin123` (from `DEV_APP_CREDENTIALS` / `QA_APP_CREDENTIALS`).

---

## 3. Entry Criteria
- Application is reachable and responds with HTTP 200 on the PIM employee list endpoint
- Authentication works (Admin user can log in)
- At least one employee record exists (populated demo data)

## 4. Exit Criteria
- All automated test cases in test-cases.md have been executed
- Pass rate ≥ 80% for API tests and ≥ 80% for UI tests
- All genuine failures have a Jira bug draft
- execution-summary.md written and reviewed

---

## 5. Risk Areas
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Demo environment shared — test data may be polluted by other users | High | Medium | Use unique employee IDs/names with timestamps; clean up after each test |
| OrangeHRM demo server flakiness (rate limiting, resets) | Medium | High | Retry policy applied; note flaky vs. genuine failures |
| Employee empNumber is auto-assigned — tests must not hard-code it | Medium | Medium | Capture empNumber from POST response and use it in subsequent calls |
| No Figma design to compare against — UI tests rely solely on live app structure | Low | Low | Selectors based on ARIA roles and stable data-testid attributes |

---

## 6. Test Pyramid Mix

Target:
- **API: 65%** — all CRUD operations, search/filter, validation, reference data lookups
- **UI: 28%** — add-employee form rendering, field validation messages, navigation to employee profile, employee list table rendering
- **Manual E2E: 7%** — end-to-end HR workflow (create employee → assign role → verify dashboard reflects change)

Expected counts: ~13 API, ~6 UI, ~1-2 Manual.

---

## 7. Per-Story Test Summary

### KAN-4 (Epic — Employee Information Management)
Since KAN-4 has no sub-stories in Jira, all test cases are authored against the Epic's stated acceptance criteria:
> "Employee information is maintained accurately and can be searched, updated, and tracked efficiently."

#### What is being tested and why:
1. **Employee List (search/filter/sort)** — Core HR administrator function; must return correct records and support filtering by name, ID, employment status, job title, and sub-unit.
2. **Employee Create (POST)** — New hire onboarding depends on this; test happy path and field-validation failures (missing required name, duplicate Employee ID).
3. **Employee Read (GET by empNumber)** — Profile view is the primary read surface; must return full employee details.
4. **Employee Update (PUT/PATCH)** — HR needs to keep records current; test personal details update.
5. **Employee Delete** — Termination workflow; test deletion and verify absence from list.
6. **Reference Data APIs** — Job titles, employment statuses, sub-units power the search dropdowns; must return non-empty lists.
7. **UI Add Employee form** — Render, field layout, required-field validation messages, successful submission redirect.
8. **UI Employee List page** — Table renders, search bar works, results update on filter submit.
