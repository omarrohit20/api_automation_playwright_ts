# Test Plan — KAN-4: Employee Information Management
**Run:** 03  
**Date:** 2026-07-14  
**Environment:** QA (https://opensource-demo.orangehrmlive.com) — OrangeHRM OS 5.9  
**Tester:** QA Analyst (automated pass)

---

## 1. Scope

### In Scope

Epic KAN-4 — Employee Information Management (OrangeHRM PIM module). All six linked stories:

| Story | Title |
|-------|-------|
| KAN-5 | View Employee List |
| KAN-6 | Search Employee |
| KAN-7 | Add Employee |
| KAN-8 | Update Employee Information |
| KAN-9 | Delete Employee Record |
| KAN-10 | Maintain Employee Documents |

API surface discovered via network capture (see `network-capture.md`): `GET/POST/PUT/DELETE /api/v2/pim/employees*`

### Out of Scope

- OrangeHRM modules other than PIM (Leave, Recruitment, Performance, etc.)
- Non-functional performance/load testing
- SSO / external auth integration
- Browser compatibility beyond Desktop Chrome
- Accessibility compliance (WCAG)

---

## 2. Environments

| Env | URL | Credentials |
|-----|-----|-------------|
| QA/Dev (same instance) | https://opensource-demo.orangehrmlive.com | Admin / admin123 |

---

## 3. Entry Criteria

- OrangeHRM demo instance responds at the health check URL (confirmed — HTTP 302 to login; login succeeds)
- PIM > Employee List renders with 200+ records
- Auth setup script can obtain and persist session state to `playwright/.auth/admin.json`

---

## 4. Exit Criteria

- All automated test cases execute (pass or fail; no skips due to setup issues)
- All API test cases execute against live endpoints
- Every genuine failure is classified as either automation-defect or application-defect
- `report.md`, `execution-summary.md`, and `jira-bug-drafts.md` written

---

## 5. Risk Areas

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Shared demo data modified by other users | High | Medium | Use unique timestamps in employee IDs; cleanup after each test |
| Network instability on public demo server | Medium | Medium | Single retry on failure before classifying as application defect |
| Delete operation removes seed data needed by other tests | Medium | High | Create/cleanup within each test; no cross-test data dependency |
| Attachment upload size/type validation not documented in ACs | Low | Low | Note as observation; test supported types only |

---

## 6. Test Pyramid Mix

**Target:** 60–70% API / 20–30% UI / 5–10% Manual E2E

| Layer | Count | Percentage | Notes |
|-------|-------|-----------|-------|
| API | 18 | 62% | All CRUD ops + search + reference data + negative cases |
| UI | 9 | 31% | Rendering, client-side validation, navigation, file upload dialog |
| Manual E2E | 2 | 7% | Full employee lifecycle (create → update → delete) + document workflow |
| **Total** | **29** | **100%** | |

---

## 7. Stories Summary

### KAN-5: View Employee List
Testing that the employee list page renders with expected columns (Id, First Name, Last Name, Job Title, Employment Status, Sub Unit, Supervisor), shows correct record count, and supports pagination.

### KAN-6: Search Employee
Testing search by Employee Name (autocomplete), Employee Id (text), Employment Status (dropdown), Job Title (dropdown), Sub Unit (dropdown). Verifies matching results returned and "No Records Found" on no match.

### KAN-7: Add Employee
Testing creation with mandatory fields (First Name, Last Name, Employee Id). Verifies employee appears in list after creation. Tests validation when mandatory fields are missing.

### KAN-8: Update Employee Information
Testing editing First Name and Last Name on the Personal Details page. Verifies changes persist after re-opening the profile. Tests via both UI and API.

### KAN-9: Delete Employee Record
Testing single employee deletion via Employee List (checkbox + delete). Verifies confirmation dialog appears. Verifies deleted employee no longer appears in search results.

### KAN-10: Maintain Employee Documents
Testing document upload on the employee profile Attachments section. Verifies uploaded document appears in the attachments list.
