# QA Analyst Agent

An end-to-end QA analyst subagent for this repo, defined in [.claude/agents/qa-analyst.md](.claude/agents/qa-analyst.md). Give it a Jira Epic or Story key and it plans, seeds, automates, executes, and reports on testing for that Epic/Story — from Copilot, Cursor, Claude Code, or any agent runner that supports this repo's `.claude/agents/` definitions.

It owns test-plan authoring, planning orchestration, the deployment gate, seeding, test execution, result analysis, and reporting itself, but **delegates test case design** (step 1) and **script authoring** (step 4) to specialized sibling agents rather than reimplementing their depth:

- [.claude/agents/qa-test-designer.md](.claude/agents/qa-test-designer.md) — QA test case design agent. Applies the full design-technique checklist (happy path, negative, boundary value, edge case, integration, non-functional) with AC-coverage traceability, and produces `qa/test-cases.md`.
- [.claude/agents/api-automation-architect.md](.claude/agents/api-automation-architect.md) — API wrapper-class + JSON-fixture + template-assertion pattern (`spec/api/`, `libs/`, `test_data/`).
- [.claude/agents/ui-automation-architect.md](.claude/agents/ui-automation-architect.md) — Page Object Model, Data Factory, Builder, Facade, and Strategy patterns for browser-driven specs.

qa-analyst invokes these via the Agent tool, so each pattern's/discipline's rules live in one place instead of being duplicated across agent definitions. For step 1, qa-analyst writes `test-plan.md` itself, pulls Figma frames itself (qa-test-designer doesn't), and folds qa-test-designer's `qa/test-cases.md` output into its own `qa-artifacts/<KEY>/test-cases.md`.

**There's no "gap-fill" exception to delegation.** qa-analyst never writes or edits files under `spec/api/`, `libs/`, `test_data/` (API) or `spec/ui/`, `libs/pages/`, `facades/`, `factories/`, `strategies/` (UI) itself — every new or changed test case in those paths goes through an actual Agent tool call to `api-automation-architect` or `ui-automation-architect`, even ones that look like a small follow-up to something already scaffolded. `script-changes.md`'s Author column should only ever say `qa-analyst` for a step 5 one-line fix to an existing automation defect — never for new test coverage. (This was previously a real gap: a run's log showed spec files authored directly by qa-analyst as a "gap-fill," which is exactly the pattern this rule now blocks.)

## Test pyramid

qa-analyst steers every Epic/Story's test-case mix toward **60-70% API, 20-30% UI, 5-10% manual-only E2E**. Backend-verifiable behavior goes to the API layer (including endpoints discovered only via network-call capture, see step 3), the UI layer is reserved for what can only be checked by rendering/interacting, and a small slice of high-value cross-system journeys stay manual by design — never automated. The achieved mix is reported in `test-plan.md` and the final report; if an Epic genuinely can't hit this ratio (e.g. UI-only, no API surface), the agent says so instead of forcing test cases into the wrong layer.

**Every automated test — API or UI — is tagged `@smoke`, `@sanity`, and/or `@regression`.** Tags are applied at authoring time (step 4) via Playwright's native tag syntax (`test('...', { tag: ['@smoke', '@regression'] }, ...)`) so runs can select by tier with `--grep`: `@smoke` is the minimal fast-fail set proving the build isn't broken, `@sanity` targets just this Epic/Story's changes, `@regression` is the full impacted set run every time. An automated test with no tag is treated as an incomplete delegation, same severity as a missing script — `script-changes.md`'s Tags column is checked for this on every run.

**Network-discovered API endpoints must be acted on the same run they're found, not deferred.** Test cases get typed in step 1, before network capture happens in step 3 — so step 3 includes a mandatory reclassification pass: any endpoint captured during seeding that verifies a currently UI-only test case gets a real `Type: API` test case added right then, and step 4 must actually produce its `api-automation-architect` script this run. "Documented for future API test expansion" is treated as a failed run, not a valid outcome — every skipped endpoint needs its own specific reason (e.g. unsafe to exercise against shared demo data), not a blanket deferral.

## What it does

Given a Jira Epic/Story key (e.g. `PROJ-1234`), it runs seven steps in order:

1. **Test plan and test cases** — resolves which run folder this is (first run or a re-run, see Artifacts below), pulls the Epic and every linked Story, Task, and Sub-task from Jira, plus linked Figma frames; writes `test-plan.md` itself (including the test-pyramid mix), and delegates test case design to `qa-test-designer` (targeting that mix), folding its output into `test-cases.md`.
2. **Deployment gate + Figma parity check** — confirms the target environment is up and the Epic/Story's changes are actually deployed there; if Figma frames were linked, also compares the live app against them and logs discrepancies. If the env is down or changes are missing, it **stops and reports a blocker** instead of continuing.
3. **Seed data + network capture** — ensures API and UI seed data is scripted (not manual), extending existing seed scripts where possible; all seeding runs **headless**, for both API and UI — no visible browser. While seeding, captures every distinct network call the app makes into `network-capture.md`, then immediately cross-checks captured endpoints against `test-cases.md` and adds/converts `Type: API` test cases for anything a UI-only case could equally be verified through — this happens before moving on, not left as a note for later.
4. **Automation scripts** — delegates to `api-automation-architect` (using captured network shapes for API test cases, including endpoints not explicitly named in the ticket) and `ui-automation-architect` (see above) to create/update Playwright API and UI scripts, following this repo's existing conventions (or any `.cursor/rules` / Copilot instructions present, which take precedence) rather than inventing new patterns. Any `Type: API` case step 3 just added gets its script written in this same step — not deferred, and always via a real delegation to `api-automation-architect`, never authored directly. Every test is tagged `@smoke`/`@sanity`/`@regression` at this point, API and UI alike.
5. **Test execution** — runs **only** the tests impacted by the Epic/Story, always **headless** (no `--headed`, for API and UI alike) — never the full suite or unrelated pre-existing specs. Uses the smoke/sanity/regression tags to scope runs (`--grep @smoke` as a fast-fail gate before the full run, `--grep @regression` for the full impacted set), in addition to path-based impacted-scope filtering. On a re-run, the **full impacted scope is executed again from scratch**, not just what changed since last time. Failing tests get **at most one retry**; it does not loop trying fixes indefinitely — if a failure survives one retry and one considered fix attempt, it's carried into analysis as a possible genuine issue rather than debugged forever. Manual-only scenarios are walked live via MCP (also headless) where feasible and otherwise listed as requiring manual execution.
6. **Report analysis** — parses automation results and evidence (screenshots/videos/traces), distinguishes automation defects from genuine behavior deviations from the Epic/Story spec, and folds in any Figma-vs-app discrepancies from step 2.
7. **Reporting** — writes both a detailed `report.md` and a short, high-level `execution-summary.md` into this run's folder, updates `latest.md`, and drafts Jira-formatted bug reports for genuine failures. Both report files are re-read from disk to confirm they were actually persisted before the run is declared complete — a chat summary alone doesn't count as this step being done. **It does not file real Jira tickets on its own** — it asks for confirmation first, and re-runs each confirmed draft's failing test once more to make sure it still reproduces before actually filing it.

## Setup

1. Copy the secrets template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   Required variables: `JIRA_API_TOKEN`, `FIGMA_API_TOKEN`, `GIT_TOKEN`, `DEV_APP_CREDENTIALS`, `QA_APP_CREDENTIALS`. `.env` is git-ignored — never commit it.

2. Edit [config/qa-agent.config.json](config/qa-agent.config.json) with your actual settings:
   - `jira.baseUrl` / `jira.projectKey` — your Jira site and project
   - `figma.teamId` / `figma.defaultFileId` — if you want a default Figma file
   - `environments.<env>.appUrl` / `apiBaseUrl` — per-environment URLs used for the deployment gate and test runs
   - `artifacts.rootDir` — where generated artifacts are saved (default `qa-artifacts`)

3. Nothing else to install for Jira/Figma — the agent calls them directly over their REST APIs using the tokens above.

4. For UI work, the agent uses the **Playwright CLI** and the **Playwright MCP server** — make sure both are available:
   - Playwright CLI: already part of this repo's `devDependencies`; runs via `npx playwright ...`.
   - Playwright MCP server: must be connected in your agent runner (Claude Code, Cursor, Copilot) as `mcp__playwright__*` tools — e.g. add it via `claude mcp add playwright` (or your tool's MCP config) so `browser_navigate`, `browser_snapshot`, `browser_click`, etc. are available to the agent.

## Usage

Invoke it with an Epic or Story key:

> Run the qa-analyst agent for PROJ-1234

Or, in Claude Code, via the Agent tool with `subagent_type: qa-analyst`.

If `.env` is missing or a required token is empty, the agent stops and reports that as a blocker before making any Jira/Figma calls — it will not fabricate data.

## Artifacts

Everything the agent produces for Epic/Story `<KEY>` is saved under `qa-artifacts/<KEY>/` (checked into git so it's shareable), organized **per run** — every invocation against a key gets its own numbered, immutable folder:

```
qa-artifacts/<KEY>/
  latest.md          ← current run number + run-history table
  run-01/             ← first invocation
    test-plan.md
    test-cases.md
    network-capture.md
    script-changes.md
    report.md
    execution-summary.md
    jira-bug-drafts.md
  run-02/             ← a later re-run
    ...same files...
    delta.md          ← what changed vs. run-01, and why this run happened
```

| File | Produced in step | Contents |
|---|---|---|
| `latest.md` | — | Pointer to the current run + a history table (run #, date, trigger, go/no-go) |
| `test-plan.md` | 1 | Scope, environments, entry/exit criteria, risk areas, test-pyramid mix — authored by qa-analyst itself |
| `test-cases.md` | 1 | Per-issue test case tables (steps, expected result, automated Y/N, priority) — merged from qa-test-designer's `qa/test-cases.md`, plus Figma-derived UI notes |
| `delta.md` | 1 (re-runs only) | What changed in Jira/Figma/test-cases/scripts/results vs. the previous run, with a reference to that run's folder |
| `network-capture.md` | 3 | Distinct API endpoints observed during UI seeding/test execution (method, path, status, request/response shape) |
| `script-changes.md` | 4 | Every spec/wrapper/page-object/fixture file created or modified, with why |
| `report.md` | 7 | Detailed report — results, deviations, failure evidence, Figma parity findings |
| `execution-summary.md` | 7 | Short, high-level pass/fail + go/no-go summary, readable in under a minute |
| `jira-bug-drafts.md` | 7 | Draft Jira bug reports for genuine failures, pending your approval |

**Re-running the agent for the same key never overwrites a previous run.** It creates the next `run-N/` folder, writes `delta.md` comparing it to the prior run, and re-executes the **full impacted scope** for the Epic/Story from scratch — not just what changed. A run folder is only edited in place if you resume an interrupted invocation of that same run; a new invocation always gets a new folder.

## Filing Jira bugs

Step 7 only **drafts** bugs in `jira-bug-drafts.md`. The agent will show you the drafts and ask which ones to file. **Before actually filing a confirmed draft, it re-runs that test/scenario once more** to make sure the failure still reproduces right now — a single confirmation re-run, separate from step 5's retry policy, not another debug loop. If it now passes, the draft is marked as no-longer-reproducing instead of being filed. Only for drafts that still fail does it call the Jira REST API (`POST /rest/api/3/issue`) to create the real tickets, and it reports back the created issue keys/links.

## Playwright CLI and MCP server usage

The agent uses two distinct Playwright surfaces, deliberately kept separate:

- **Playwright CLI** (`npx playwright ...`, via Bash) — for anything script-authoring and test-execution related: `codegen` to derive selectors when scaffolding a new UI spec, `test --list` to confirm scope, `test`/`test --grep "..."` to run impacted specs headless (API and UI alike), and `show-report`/`test-results` to analyze results.
- **Playwright MCP server** (`mcp__playwright__*` tools) — for live, interactive browser work: confirming the deployment gate actually rendered the new UI, comparing the live app against linked Figma frames, walking UI seed flows that have no API shortcut while capturing the network calls they trigger (`browser_network_requests`), inspecting live DOM/selectors before writing a spec, running feasible manual-only scenarios as observed (not automated) checks, and reproducing failures for root-cause analysis (`browser_snapshot`, `browser_console_messages`, `browser_network_requests`).

If the Playwright MCP server isn't connected in your agent runner, the agent will still complete Jira/Figma-based planning and CLI-driven test execution, but will flag any step that needed live browser interaction (deployment gate's UI check, UI seeding, live selector discovery, manual-scenario walkthroughs, failure repro) as blocked/skipped rather than fabricating the result.

### Always headless — no visible browser, for any test type

Seeding, automated execution, and manual/MCP-driven walkthroughs all run **headless**, for both API and UI. No step opens a visible browser window.

- Both API (`spec/api/...`) and UI (`spec/ui/...`) runs execute with no `--headed` flag.
- If a Playwright MCP server session launches its own browser for a manual/live walkthrough, it's started/connected in headless mode too.
- If `playwright.config.ts` defaults any project the agent touches to `headed`, that's flagged as inconsistent with this rule rather than relied on.

## Notes

- The agent talks to Jira/Figma via their REST APIs directly using the tokens in `.env` — it does not rely on Jira/Figma MCP servers, since those may not be authorized in headless or non-interactive runs.
- It follows this repo's existing wrapper-class + JSON-fixture + template-assertion conventions for API tests (see the main [README.md](README.md) and [CLAUDE.md](CLAUDE.md)); it does not introduce a different pattern.
- **It only executes tests impacted by the Epic/Story — never the full suite and never other pre-existing, unrelated specs.**
- **Every re-run still executes the full impacted scope, not just a diff.** `delta.md` documents what changed since the last run, but execution itself always re-validates every Story/Task under the key.
- **Retry policy is strict:** a failing test gets at most one retry, plus at most one considered fix-and-retry if the cause looks like an obvious automation defect. Anything that still fails after that is treated as a possible genuine application issue for step 6, not looped on indefinitely — the assumption shifts from "my script is wrong" to "this might be the application."
- API test coverage isn't limited to what the Jira ticket names explicitly — network calls captured during seeding surface real endpoints (including undocumented ones) that get turned into API tests, which is how the agent pushes toward the 60-70% API slice of the test pyramid.
- **A captured endpoint with no automation and no specific per-endpoint reason is a bug in the run, not an acceptable gap.** If you see `network-capture.md` describing discovered endpoints as "future work" instead of either a script or a stated reason it wasn't automated, the run didn't follow this rule correctly.
- **Check `script-changes.md`'s Author column when reviewing a run.** Every API/UI spec, wrapper, or page object should be authored by `api-automation-architect`/`ui-automation-architect`, not `qa-analyst` — `qa-analyst` as author is only valid for a step 5 one-line defect fix to a file that already existed. If new test coverage is attributed to `qa-analyst`, delegation was skipped and the run should be treated as incomplete for that test case.
- **Check `script-changes.md`'s Tags column too.** Every automated test, API or UI, should show at least one of `@smoke`/`@sanity`/`@regression`. A blank Tags entry means step 4 shipped a test without tagging it — treat that the same as a missing script for that test case.
- When Figma frames are linked, the agent checks the live app against them during the deployment gate and folds discrepancies into the report — this is best-effort visual/structural comparison via the Playwright MCP server, not a pixel-perfect diff tool.
- **Runs are immutable history** — re-running an Epic/Story never edits a previous run's folder; it always creates the next `run-N/` and updates `latest.md`.
