# Jira Bug Drafts — KAN-4: Employee Information Management

No genuine behavioral deviations from the Epic's acceptance criteria were found during this test cycle. All failures observed during script development were automation defects (wrong selectors, wrong page object assumptions), not application bugs. All 13 automated UI tests and 28 API sanity tests pass cleanly against the `dev` environment.

**No bug drafts to file.**

## Noteworthy application characteristic (not a defect, no draft needed)

OrangeHRM's Employee Name search field (KAN-6) is a server-side Vue autocomplete requiring a suggestion to be selected from the dropdown before the search is submitted — plain `fill()` input alone does not trigger a search. This is a deliberate OrangeHRM UX design, not a bug. See `qa-artifacts/KAN-4/report.md` for the full write-up and how the automated test was adapted (Employee ID search) with the Employee Name path verified manually via MCP browser walk.

If this comes up again on a future Epic touching PIM search, consider whether it's worth a low-priority *test-tooling* ticket (not a product bug) to invest in a Playwright autocomplete-selection helper so name-based search can be automated directly, rather than an application defect ticket.
