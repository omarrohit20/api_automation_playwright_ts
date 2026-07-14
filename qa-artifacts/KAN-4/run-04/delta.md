# Delta — KAN-4 Run-04 vs Run-03
**Date:** 2026-07-14  
**Previous run:** qa-artifacts/KAN-4/run-03/ (artifacts deleted from disk per git status; delta based on git history context)

---

## What changed in Jira since run-03
- KAN-4 Epic status: still "To Do" — no sub-stories were added or removed
- No new acceptance criteria
- No Figma frames linked (unchanged)
- Summary: No Jira changes between runs. This run was triggered for full re-validation per the user's request.

---

## What changed in test-cases.md
- Added **TC-033** (new, API): GET personal-details endpoint discovered via network capture during seeding. This endpoint was not explicitly covered in prior runs. Added in the reclassification pass (step 3).
- Test case count: 32 → 33 total (23 API, 6 UI, 1 Manual E2E)

---

## What changed in automation scripts
All scripts were re-created from scratch (prior run scripts were deleted per git status):
- `libs/pim.ts` — New PIM wrapper class (api-automation-architect)
- `spec/api/pim-employees.spec.ts` — New PIM API spec (api-automation-architect)
- `config/hosts.json` — Added `orangehrm` key (api-automation-architect)
- `libs/pages/pim/EmployeeListPage.ts` — New page object (ui-automation-architect)
- `libs/pages/pim/AddEmployeePage.ts` — New page object (ui-automation-architect)
- `spec/ui/pim/employee-list.spec.ts` — New UI spec (ui-automation-architect)
- `spec/ui/pim/add-employee.spec.ts` — New UI spec (ui-automation-architect)

---

## Results comparison

| Category | Run-03 (prior) | Run-04 (this) |
|----------|---------------|----------------|
| API tests | N/A (scripts deleted) | 22/22 passed |
| UI tests | N/A (scripts deleted) | 5/5 passed |
| Manual E2E | Not run | 1 (not automated by design) |
| Blockers | Scripts deleted | None |
| Go/No-Go | N/A | GO |

---

## Newly passing / newly failing
- All 22 API tests: **newly passing** (re-created)
- All 5 UI tests: **newly passing** (re-created)
- No newly failing tests
- No previously-passing tests that are now failing
