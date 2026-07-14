# Script Changes — KAN-4 run-03

| File | Change Type | Reason | Author |
|------|-------------|--------|--------|
| `libs/pim.ts` | New | PIM API wrapper class covering all /api/v2/pim/* and /api/v2/admin/* endpoints needed for KAN-4 test cases. Implements authenticate(), getEmployees(), getEmployee(), getPersonalDetails(), createEmployee(), updatePersonalDetails(), deleteEmployees(), getAttachments(), createAttachment(), getEmploymentStatuses(), getJobTitles(), getSubunits(). | api-automation-architect |
| `spec/api/pim-employees.spec.ts` | New | API test spec covering 20 test cases across KAN-5 through KAN-10. Includes full CRUD lifecycle, pagination, search/filter, reference data, and attachment endpoints. Uses beforeAll/afterAll for test employee lifecycle management. | api-automation-architect |
| `libs/pim.ts` | Bug fix (URLs + delete body) | Corrected 5 bugs: deleteEmployees now sends ids in request body; getAttachments uses correct /screen/personal/attachments path; getEmploymentStatuses, getJobTitles, getSubunits use correct /api/v2/admin/* paths (not wrong pim/core/corporate-branding paths). | api-automation-architect |
| `spec/ui/pim/employee-list.spec.ts` | New | UI spec covering KAN5-TC-001 (column headers), KAN5-TC-003 (pagination), KAN6-TC-001 (search by name), KAN6-TC-003 (no records found). Uses EmployeeListPage page object. | ui-automation-architect |
| `spec/ui/pim/add-employee.spec.ts` | New | UI spec covering KAN7-TC-001 (add with mandatory fields), KAN7-TC-003 (missing first name validation), KAN7-TC-004 (missing last name validation). Uses AddEmployeePage and EmployeeListPage page objects. | ui-automation-architect |
| `spec/ui/pim/employee-profile.spec.ts` | New | UI spec covering KAN8-TC-001 (update first name persists), KAN9-TC-001 (confirmation dialog), KAN9-TC-002 (confirm delete removes from list), KAN9-TC-004 (cancel delete aborts), KAN10-TC-001 (PDF upload via attachments section). Uses all three PIM page objects. | ui-automation-architect |
| `spec/ui/pim/employee-profile.spec.ts` | Bug fix (auth context) | Added storageState: 'playwright/.auth/admin.json' to all 4 browser.newContext() calls in beforeAll/afterAll blocks so setup contexts are authenticated. | ui-automation-architect |

## Files NOT modified (existing page objects used as-is)
- `libs/pages/pim/EmployeeListPage.ts` — unchanged
- `libs/pages/pim/AddEmployeePage.ts` — unchanged
- `libs/pages/pim/EmployeeProfilePage.ts` — unchanged
- `spec/ui/auth.setup.ts` — unchanged
- `config/hosts.json` — orangehrm key already present, no modification needed

## Seed script note
`spec/seed/pim-seed.ts` exists with `headless: true` — this is a pre-existing violation of the "always headed" execution rule. The script is not invoked by the test runner (it's a standalone script), so it does not affect test execution. Flagged for remediation by ui-automation-architect in a future run.
