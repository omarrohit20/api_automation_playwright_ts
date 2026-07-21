# Test Plan — KAN-14: View Leave List
**Run:** run-01  
**Date:** 2026-07-15  
**Epic:** KAN-12 — Leave Management  
**Story:** KAN-14 — View Leave List  
**Environment:** QA / DEV (https://opensource-demo.orangehrmlive.com)  
**Tester:** QA Analyst Agent  

---

## 1. Scope

### In Scope
- Viewing the Leave List page as an HR Manager
- Verification that the leave request list renders after opening the Leave Management module
- Column presence validation: Employee Name, Leave Type, From Date, To Date, Number of Days, Status
- Pagination behavior when records exceed the page size
- API endpoint coverage for leave-requests retrieval (GET /api/v2/leave/employees/leave-requests)
- Filter interaction (Search / Reset) behavior
- Leave Type dropdown population from API
- Edge cases: empty results, boundary dates, invalid params

### Out of Scope
- Creating/submitting new leave requests (covered by a different story)
- Approving/rejecting leave requests
- Leave balance management
- My Leave module (employee self-service)

---

## 2. Environments

| Env | App URL | API Base |
|-----|---------|----------|
| QA/DEV | https://opensource-demo.orangehrmlive.com | https://opensource-demo.orangehrmlive.com/web/index.php |

Credentials: Admin / admin123 (from QA_APP_CREDENTIALS / DEV_APP_CREDENTIALS)

---

## 3. Entry Criteria
- OrangeHRM demo app is live and accessible
- Leave Management module is deployed (accessible via /web/index.php/leave/viewLeaveList)
- Auth session obtainable via login flow

## 4. Exit Criteria
- All automated test cases executed
- Pass rate >= 80% (given shared demo environment variability)
- All genuine failures have Jira bug drafts
- report.md and execution-summary.md written

---

## 5. Risk Areas
- Shared demo environment: data may change between runs, affecting count-based assertions
- OrangeHRM session cookie expiry during long test runs
- Pagination: demo may not have enough records to trigger multi-page results
- Date-sensitivity: leave period default dates change per calendar year

---

## 6. Test Pyramid Mix (Target)

| Layer | Count | % |
|-------|-------|---|
| API   | 10    | 63% |
| UI    | 5     | 31% |
| Manual E2E | 1 | 6% |
| **Total** | **16** | **100%** |

This mix targets the 60-70% API / 20-30% UI / 5-10% Manual-E2E pyramid.

---

## 7. Story Summary — KAN-14: View Leave List

**User Story:** As an HR Manager, I want to view a list of employee leave requests so that I can track leave applications and their statuses.

**Acceptance Criteria:**
1. Given I am on the Leave List page, When I open the leave management module, Then I should see a list of leave requests.
2. The list should display: Employee Name, Leave Type, From Date, To Date, Number of Days, Status.
3. The list should support pagination when records exceed the page size.

**What is being tested and why:**
- API layer verifies that the backend correctly returns leave request data with the expected fields and status codes — this is the primary behavioral validation.
- UI layer verifies that the frontend renders the leave list correctly, that columns match the AC, that the Leave Type dropdown populates, and that Search/Reset interactions work.
- Manual E2E covers the end-to-end journey from login through Leave module navigation and pagination verification — high-value but low-change-frequency.
