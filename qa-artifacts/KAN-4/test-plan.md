# Test Plan — KAN-4: Employee Information Management

## Overview

| Field | Value |
|-------|-------|
| Epic | KAN-4 — Employee Information Management |
| Jira URL | https://omarrohit20.atlassian.net/browse/KAN-4 |
| Application | OrangeHRM (PIM Module) |
| Environment | dev — https://opensource-demo.orangehrmlive.com/ |
| Test Plan Date | 2026-07-13 |
| Author | QA Analyst (automated via Claude QA Agent) |

## Epic Description

As an HR Administrator, I want to manage employee records in the OrangeHRM PIM module so that employee information is maintained accurately and can be searched, updated, and tracked efficiently. The PIM module serves as a centralized repository for employee data and supports employee search, creation, editing, and record maintenance.

---

## Scope

### In Scope

| Story/Task | Title | Type |
|------------|-------|------|
| KAN-5 | View Employee List | UI |
| KAN-6 | Search Employee | UI |
| KAN-7 | Add Employee | UI |
| KAN-8 | Update Employee Information | UI |
| KAN-9 | Delete Employee Record | UI |
| KAN-10 | Maintain Employee Documents | UI |
| KAN-11 | Create and Manage Custom Employee Fields | UI |

All scenarios are UI-driven via the OrangeHRM web application. No public REST API is exposed for PIM operations, so all tests are UI automation or manual.

### Out of Scope

- OrangeHRM modules outside PIM (Leave, Recruitment, Payroll, etc.)
- Direct database-level validation
- Performance / load testing
- Mobile browser testing
- API-level PIM operations (no public API endpoints documented for this demo app)

---

## Environments

| Environment | URL | Credentials |
|-------------|-----|-------------|
| dev | https://opensource-demo.orangehrmlive.com/ | Admin / admin123 |
| qa | https://opensource-demo.orangehrmlive.com/ | Admin / admin123 |

---

## Entry Criteria

- OrangeHRM demo application is accessible at the configured URL
- Admin credentials (from DEV_APP_CREDENTIALS) are valid
- PIM module is reachable via the top navigation
- Test environment is confirmed up via health check and UI snapshot

## Exit Criteria

- All automated test cases in scope have been executed
- All critical and high priority failures have been triaged (automation defect vs. genuine behavioral deviation)
- Test report and bug drafts (if any) have been produced
- Manual-only scenarios have been observed or documented as requiring manual execution

---

## Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| OrangeHRM demo app is a shared public instance — data created by other users may interfere | Medium | Use unique employee names/IDs with timestamps; clean up after tests |
| Demo app may reset periodically | Medium | Run tests quickly in sequence; log state before/after |
| No API available for seeding — all seeding must be UI-driven | Medium | Implement UI seed scripts using Playwright; document in `spec/seed/` |
| Custom field configuration (KAN-11) may require admin config prior to employee record test | Medium | Seed custom field configuration before employee profile tests |
| Delete tests (KAN-9) are destructive — must not delete seed data needed by other tests | High | Create isolated employee records per test; delete only records created by that test |

---

## Story-by-Story Summary

### KAN-5 — View Employee List
Tests that an authenticated HR Admin can navigate to PIM > Employee List and see a populated list with correct columns (Employee ID, Name, Job Title, Employment Status, Sub Unit, Supervisor) and pagination controls.

### KAN-6 — Search Employee
Tests that the Employee List search form accepts and correctly filters by: Employee Name, Employee ID, Employment Status, Job Title, Sub Unit, Supervisor Name. Also validates that a "No Records Found" message appears when no matches exist.

### KAN-7 — Add Employee
Tests that submitting the Add Employee form with mandatory fields (First Name, Last Name, Employee ID) creates a new record visible in the Employee List. Also validates form validation on missing mandatory fields.

### KAN-8 — Update Employee Information
Tests that editing and saving changes to any of the editable sections (Personal Details, Contact Details, Job Information, Qualifications, Memberships, Emergency Contacts, Dependents, Attachments) persists the changes when the profile is reopened.

### KAN-9 — Delete Employee Record
Tests that selecting Delete on an employee record shows a confirmation dialog, and confirming deletion removes the record from the list and search results.

### KAN-10 — Maintain Employee Documents
Tests that uploading a supported file to an employee profile attaches it successfully, and that the document is visible and downloadable from the profile.

### KAN-11 — Create and Manage Custom Employee Fields
Tests that custom fields configured in the system appear on employee profiles and that values entered and saved persist upon reopening the profile.

---

## Test Types

| Type | Coverage |
|------|----------|
| UI Automation (Playwright) | Happy path, key negative, boundary for KAN-5 through KAN-11 |
| Manual/MCP-observed | Edge cases that are impractical to automate on the shared demo app |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Test Cases | qa-artifacts/KAN-4/test-cases.md |
| Script Changes Log | qa-artifacts/KAN-4/script-changes.md |
| Report | qa-artifacts/KAN-4/report.md |
| Jira Bug Drafts | qa-artifacts/KAN-4/jira-bug-drafts.md |
