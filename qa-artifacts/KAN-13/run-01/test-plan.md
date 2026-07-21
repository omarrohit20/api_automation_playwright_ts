# Test Plan — KAN-13: Search Leave Requests
**Run:** run-01  
**Date:** 2026-07-14  
**Environment:** QA / DEV (https://opensource-demo.orangehrmlive.com)  
**Tester:** QA Analyst (automated via qa-analyst agent)

---

## 1. Scope

### In Scope
- KAN-13 (Story): Search Leave Requests under Epic KAN-12 "Leave Management"
- Leave List page: `/web/index.php/leave/viewLeaveList`
- All five filter fields: Employee Name, Leave Status, Leave Type, Date Range, Employee Sub Unit
- Search results matching/filtering behavior
- Reset button clearing all filters and restoring default view
- Backend REST API endpoints powering the Leave List feature

### Out of Scope
- Leave application / submission (Apply Leave — separate story)
- Leave approval/rejection workflow
- Leave entitlement management
- Other Leave module sub-menus (My Leave, Entitlements, Reports, Configure)
- Authentication / session management (covered by auth.setup.ts)

---

## 2. Environments

| Env | App URL | API Base |
|-----|---------|----------|
| dev/qa | https://opensource-demo.orangehrmlive.com/ | https://opensource-demo.orangehrmlive.com/web/index.php |

Credentials: `Admin` / `admin123` (from `QA_APP_CREDENTIALS` env var).

---

## 3. Entry / Exit Criteria

**Entry:**
- Application is accessible and Leave List page loads (verified Step 2)
- Valid session cookies obtainable via headless browser login
- All required API endpoints return 200 on baseline GET

**Exit:**
- All automated test cases pass (or failures triaged as genuine bugs vs. automation defects)
- network-capture.md documents all discovered endpoints
- report.md and execution-summary.md written and verified on disk

---

## 4. Risk Areas

1. **Shared demo environment** — other users may create/modify leave records concurrently, causing flakiness in exact-count assertions
2. **Status enum values** — `statuses[]` param uses numeric IDs (1=Pending, 2=Approved, etc.); if the enum changes, tests break silently
3. **Sub Unit API not captured** — the Sub Unit dropdown may populate from a cached or lazily-loaded `/api/v2/admin/subunits` call; requires confirmation
4. **Date range boundary** — year-boundary date ranges may return 0 records if no leave data exists for that period

---

## 5. Test Pyramid Mix

| Layer | Count (planned) | % |
|-------|----------------|---|
| API   | 9              | 64% |
| UI    | 4              | 29% |
| Manual E2E | 1         | 7% |
| **Total** | **14**    | **100%** |

Target: 60-70% API / 20-30% UI / 5-10% Manual. Achieved: 64% / 29% / 7% — within target.

---

## 6. Story Summary

### KAN-13 — Search Leave Requests

**User story:** As an HR Manager, I want to filter leave requests using search criteria so that I can quickly find specific leave records.

**Acceptance Criteria:**
- User can navigate to `/web/index.php/leave/viewLeaveList`
- Search by: Employee Name, Leave Status, Leave Type, Date Range, Employee Sub Unit
- Search results display only matching leave records
- Reset clears all filters and displays all records

**What's being tested and why:**
- The primary API endpoint `GET /api/v2/leave/employees/leave-requests` with every supported query parameter, because the search feature is entirely driven by this endpoint — the UI merely constructs the query and displays the response.
- Reference data endpoints (`/leave/leave-types`, `/leave/leave-periods`) which populate the filter dropdowns.
- UI layer: form rendering, search/reset interaction, results table rendering, and client-side validation (required Status field).
- Manual E2E: end-to-end scenario logging in, navigating, applying filters, verifying results, and resetting — confirms the full user journey without decomposing it.

---

## 7. Figma Notes

No Figma frames linked to KAN-13 or its parent Epic KAN-12. Figma parity check skipped.
