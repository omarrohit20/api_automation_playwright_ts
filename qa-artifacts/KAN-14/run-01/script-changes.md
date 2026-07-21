# Script Changes — KAN-14: View Leave List
**Run:** run-01  
**Date:** 2026-07-15  

---

## Files Created / Modified

| File | Change | Reason | Tags | Author |
|------|--------|--------|------|--------|
| `libs/leave.ts` | Added `getWorkweek(model?, failOnStatusCode?)` method + `workweekResponse` template | TS-028: new workweek endpoint discovered via network capture during seeding | @smoke @regression | api-automation-architect |
| `spec/api/leave-list.spec.ts` | New spec file created | KAN-14 API tests: TS-015, TS-016, TS-018, TS-020, TS-022, TS-023, TS-024, TS-028 — all with Playwright native tag syntax | @smoke @sanity @regression (per test) | api-automation-architect |
| `libs/pages/leave/LeaveListPage.ts` | Added `isPaginationNextVisible()`, `clickPaginationNext()`, `getFirstRowFirstCellText()` methods | TS-017: pagination UI test requires Next button interaction and row comparison | @sanity @regression | ui-automation-architect |
| `spec/ui/leave/leave-list.spec.ts` | Appended TS-014, TS-017, TS-019, TS-021 to existing describe block; added `chromium` import | KAN-14 UI tests for AC column presence, pagination, auth redirect, empty state | @smoke @sanity @regression (per test) | ui-automation-architect |

---

## Tag Summary by Test

| Test ID | Type | Tags |
|---------|------|------|
| TS-015 | API | @smoke @sanity @regression |
| TS-016 | API | @sanity @regression |
| TS-018 | API | @regression |
| TS-020 | API | @smoke @sanity @regression |
| TS-022 | API | @regression |
| TS-023 | API | @regression |
| TS-024 | API | @sanity @regression |
| TS-028 | API | @smoke @regression |
| TS-014 | UI | @smoke @sanity @regression |
| TS-017 | UI | @sanity @regression |
| TS-019 | UI | @smoke @sanity @regression |
| TS-021 | UI | @sanity @regression |
