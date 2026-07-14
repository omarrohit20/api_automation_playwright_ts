# Script Changes — KAN-4 Run-04
**Date:** 2026-07-14

| File | Change Type | Reason | Author |
|------|-------------|--------|--------|
| `libs/pim.ts` | Created | PIM wrapper class for OrangeHRM API — covers all employee CRUD + reference data endpoints (TC-001 to TC-026, TC-033). Uses cookie-based auth pattern, follows Users wrapper convention. | api-automation-architect |
| `spec/api/pim-employees.spec.ts` | Created | API spec covering 22 test cases (TC-001 to TC-023, TC-033) across Employee List, Create, Read, Update, Delete, and Reference Data. Includes cookie-based login helper, full cleanup in afterAll. | api-automation-architect |
| `config/hosts.json` | Modified | Added `orangehrm` key to both `dev` and `qa` environments pointing to OrangeHRM base API URL. | api-automation-architect |
| `libs/pages/pim/EmployeeListPage.ts` | Created | Page Object for Employee List UI — navigate, search by name, get table rows/headers/count. Used by TC-030, TC-031. | ui-automation-architect |
| `libs/pages/pim/AddEmployeePage.ts` | Created | Page Object for Add Employee UI — fill fields, click save, get validation messages, detect redirect to profile. Used by TC-027, TC-028, TC-029. | ui-automation-architect |
| `spec/ui/pim/employee-list.spec.ts` | Created | UI spec covering TC-030 (table renders) and TC-031 (search filter works). Uses `pim-ui` Playwright project with storageState auth. | ui-automation-architect |
| `spec/ui/pim/add-employee.spec.ts` | Created | UI spec covering TC-027 (form renders), TC-028 (inline validation), TC-029 (successful submit redirects). Uses `pim-ui` Playwright project with storageState auth. | ui-automation-architect |
