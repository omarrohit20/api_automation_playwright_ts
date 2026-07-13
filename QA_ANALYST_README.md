# QA Analyst Agent

An end-to-end QA analyst subagent for this repo, defined in [.claude/agents/qa-analyst.md](.claude/agents/qa-analyst.md). Give it a Jira Epic or Story key and it plans, seeds, automates, executes, and reports on testing for that Epic/Story — from Copilot, Cursor, Claude Code, or any agent runner that supports this repo's `.claude/agents/` definitions.

It owns test-plan authoring, planning orchestration, the deployment gate, seeding, test execution, result analysis, and reporting itself, but **delegates test case design** (step 1) and **script authoring** (step 4) to specialized sibling agents rather than reimplementing their depth:

- [.claude/agents/qa-test-designer.md](.claude/agents/qa-test-designer.md) — QA test case design agent. Applies the full design-technique checklist (happy path, negative, boundary value, edge case, integration, non-functional) with AC-coverage traceability, and produces `qa/test-cases.md`.
- [.claude/agents/api-automation-architect.md](.claude/agents/api-automation-architect.md) — API wrapper-class + JSON-fixture + template-assertion pattern (`spec/api/`, `libs/`, `test_data/`).
- [.claude/agents/ui-automation-architect.md](.claude/agents/ui-automation-architect.md) — Page Object Model, Data Factory, Builder, Facade, and Strategy patterns for browser-driven specs.

qa-analyst invokes these via the Agent tool, so each pattern's/discipline's rules live in one place instead of being duplicated across agent definitions. For step 1, qa-analyst writes `test-plan.md` itself, pulls Figma frames itself (qa-test-designer doesn't), and folds qa-test-designer's `qa/test-cases.md` output into its own `qa-artifacts/<KEY>/test-cases.md`.

## What it does

Given a Jira Epic/Story key (e.g. `PROJ-1234`), it runs seven steps in order:

1. **Test plan and test cases** — pulls the Epic and every linked Story, Task, and Sub-task from Jira, plus linked Figma frames; writes `test-plan.md` itself, and delegates test case design to `qa-test-designer`, folding its output into `test-cases.md`. If they already exist, it updates only what changed.
2. **Deployment gate** — confirms the target environment is up and the Epic/Story's changes are actually deployed there. If the env is down or changes are missing, it **stops and reports a blocker** instead of continuing.
3. **Seed data** — ensures API and UI seed data is scripted (not manual), extending existing seed scripts where possible; delegates new wrapper methods/UI flows to the agents below.
4. **Automation scripts** — delegates to `api-automation-architect` and `ui-automation-architect` (see above) to create/update Playwright API and UI scripts, following this repo's existing conventions (or any `.cursor/rules` / Copilot instructions present, which take precedence) rather than inventing new patterns.
5. **Test execution** — runs only the tests impacted by the Epic/Story, plus the sanity suite; lists manual-only scenarios it cannot execute.
6. **Report analysis** — parses automation results and evidence (screenshots/videos/traces), and distinguishes automation defects from genuine behavior deviations from the Epic/Story spec.
7. **Reporting** — writes a high-level + detailed report, and drafts Jira-formatted bug reports for genuine failures. **It does not file real Jira tickets on its own** — it asks for confirmation first.

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

Everything the agent produces for Epic/Story `<KEY>` is saved under `qa-artifacts/<KEY>/` (checked into git so it's shareable):

| File | Produced in step | Contents |
|---|---|---|
| `test-plan.md` | 1 | Scope, environments, entry/exit criteria, risk areas — authored by qa-analyst itself |
| `test-cases.md` | 1 | Per-issue test case tables (steps, expected result, automated Y/N, priority) — merged from qa-test-designer's `qa/test-cases.md`, plus Figma-derived UI notes |
| `script-changes.md` | 4 | Every spec/wrapper/fixture file created or modified, with why |
| `report.md` | 7 | High-level + detailed report, results, deviations, failure evidence |
| `jira-bug-drafts.md` | 7 | Draft Jira bug reports for genuine failures, pending your approval |

Re-running the agent for the same key updates these files in place rather than overwriting them wholesale — it diffs against current Jira/Figma state and only changes what changed.

## Filing Jira bugs

Step 7 only **drafts** bugs in `jira-bug-drafts.md`. The agent will show you the drafts and ask which ones to file. Only after you confirm does it call the Jira REST API (`POST /rest/api/3/issue`) to create the real tickets, and it reports back the created issue keys/links.

## Playwright CLI and MCP server usage

The agent uses two distinct Playwright surfaces, deliberately kept separate:

- **Playwright CLI** (`npx playwright ...`, via Bash) — for anything script-authoring and test-execution related: `codegen` to derive selectors when scaffolding a new UI spec, `test`/`test --grep` to run impacted specs and sanity, `test --list` to confirm scope, and `show-report`/`test-results` to analyze results.
- **Playwright MCP server** (`mcp__playwright__*` tools) — for live, interactive browser work: confirming the deployment gate actually rendered the new UI, walking UI seed flows that have no API shortcut, inspecting live DOM/selectors before writing a spec, running feasible manual-only scenarios as observed (not automated) checks, and reproducing failures for root-cause analysis (`browser_snapshot`, `browser_console_messages`, `browser_network_requests`).

If the Playwright MCP server isn't connected in your agent runner, the agent will still complete Jira/Figma-based planning and CLI-driven test execution, but will flag any step that needed live browser interaction (deployment gate's UI check, UI seeding, live selector discovery, manual-scenario walkthroughs, failure repro) as blocked/skipped rather than fabricating the result.

## Notes

- The agent talks to Jira/Figma via their REST APIs directly using the tokens in `.env` — it does not rely on Jira/Figma MCP servers, since those may not be authorized in headless or non-interactive runs.
- It follows this repo's existing wrapper-class + JSON-fixture + template-assertion conventions for API tests (see the main [README.md](README.md) and [CLAUDE.md](CLAUDE.md)); it does not introduce a different pattern.
- It only executes tests impacted by the Epic/Story plus sanity — not the full suite — unless impact analysis shows the change is repo-wide.
