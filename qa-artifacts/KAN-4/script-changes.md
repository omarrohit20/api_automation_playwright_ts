# Script Changes Log — KAN-4: Employee Information Management

All files created or modified as part of Epic KAN-4 UI automation scaffolding.

| File | Action | Author | Reason |
|------|--------|--------|--------|
| `playwright.config.ts` | Modified | ui-automation-architect | Added `auth-setup` and `pim-ui` Playwright projects for OrangeHRM UI testing; scoped existing API projects to `spec/api/**` via `testMatch` so the new UI tests don't run against the jsonplaceholder base URL |
| `spec/ui/auth.setup.ts` | Created | ui-automation-architect | Authenticates as Admin and saves browser storage state to `playwright/.auth/admin.json` so PIM spec tests skip repeated login (KAN-4 all stories) |
| `playwright/.auth/.gitignore` | Created | ui-automation-architect | Prevents committed auth state tokens from leaking into version control |
| `test_data/pim/sample-document.txt` | Created | ui-automation-architect | Fixture file for KAN-10 document upload test |
| `libs/pages/pim/EmployeeListPage.ts` | Created | ui-automation-architect | Page Object for PIM Employee List — locators and methods for navigation, search, reset, add, no-records check, and row-level delete (KAN-5, KAN-6) |
| `libs/pages/pim/AddEmployeePage.ts` | Created | ui-automation-architect | Page Object for PIM Add Employee form — locators for name/ID inputs and methods for filling mandatory/optional fields and saving (KAN-7) |
| `libs/pages/pim/EmployeeProfilePage.ts` | Created | ui-automation-architect | Page Object for Employee Profile page — edit personal details, upload attachment, and delete employee actions (KAN-8, KAN-9, KAN-10) |
| `spec/seed/pim-seed.ts` | Created | ui-automation-architect | UI seed helper — `seedEmployee()` creates a uniquely named test employee via browser automation and persists record to `seed-data.json`; `cleanupEmployee()` deletes by employee ID |
| `spec/ui/pim/employee-list.spec.ts` | Created | ui-automation-architect | Automated spec covering KAN-5 (view list, columns, pagination) and KAN-6 (search by name, no records found, reset) |
| `spec/ui/pim/add-employee.spec.ts` | Created | qa-analyst (gap-fill) | Automated spec covering KAN-7 — happy path add with mandatory fields, validation error on missing First Name, validation error on missing Last Name |
| `spec/ui/pim/employee-profile.spec.ts` | Created | qa-analyst (gap-fill) | Automated spec covering KAN-8 (update personal details + persist on reload), KAN-9 (delete confirmation dialog, confirm delete removes from list), KAN-10 (upload document appears in attachments) |
