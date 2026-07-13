# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run tests in debug mode
npm run test:debug

# Run tests with Playwright UI
npm run test:ui

# Run a single test file
npx playwright test spec/api/booking.spec.ts

# Run a single test by title
npx playwright test --grep "test name here"

# Run tests in a specific browser
npx playwright test --project=chromium

# View HTML report
npm run test:report
```

## Architecture

This is a Playwright-based API automation framework (no UI/browser interaction). Tests call real external APIs.

**Layers:**

1. **`spec/api/`** — Test files. Each spec imports an API wrapper class and calls helper functions from `libs/utils/`.

2. **`libs/`** — API wrapper classes (`users.ts`, `booking.ts`). Each class holds an `APIRequestContext`, exposes typed methods per endpoint, and stores the last response template for assertions.

3. **`libs/utils/`** — Shared utilities:
   - `requests.ts` — HTTP helpers (`sendGetRequest`, `sendPostRequest`, etc.) used by wrapper classes
   - `assertions.ts` — `verifyResponseTemplate()` does deep template-matching; `verifyResponseCode()` checks status codes
   - `common.ts` — `readTestDataJson()` loads fixtures; date/timestamp helpers
   - `apiTracker.ts` — `trackApiCall()` records last API call for debugging

4. **`test_data/`** — JSON fixture files. Response templates use special validation keywords: `"skip"`, `"should_not_be_null"`, `"only_chars"`, `"only_digits"`, `"match_regex:/pattern/"`.

5. **`config/hosts.json`** — Base URLs per environment (`dev`/`qa`). Select with `ENV=qa npm test`.

## Key Conventions

**Adding a new API endpoint:** Add a method to the relevant wrapper class in `libs/`, create a fixture JSON in `test_data/`, then write the test in `spec/api/`.

**Template-based assertions:** Instead of asserting individual fields, load a response template from `test_data/` and call `verifyResponseTemplate(response, template)`. The template fields drive validation; use `"skip"` for dynamic fields.

**Environment config:** API base URLs come from `config/hosts.json` keyed by the `ENV` env var (default: `dev`). Tests should not hardcode URLs.

**Context lifecycle:** API wrapper constructors accept a Playwright `APIRequestContext`. Initialize in `test.beforeAll()` and pass into the class.

## Playwright Configuration

- Base URL: `https://jsonplaceholder.typicode.com`
- Runs against Chromium, Firefox, and WebKit
- `fullyParallel: true` — tests run in parallel by default
- CI: 2 retries, single worker
- Reports: HTML (saved to `playwright-report/`)
