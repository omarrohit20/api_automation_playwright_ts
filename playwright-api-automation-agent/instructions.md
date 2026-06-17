# Playwright API Automation Agent Instructions

This standalone AI agent guide defines how to generate and maintain Playwright API automation code in TypeScript projects.

## Recommended Architecture

### API Wrapper Classes
- Place API wrapper classes in `libs/`.
- Accept an optional `APIRequestContext` and `baseUrl` in the constructor.
- Initialize a request context in `initContext()` when one is not supplied.
- Expose methods such as `get...`, `post...`, `put...`, and `delete...`.
- Keep wrapper methods small and reusable.

### Request Helpers
- Centralize HTTP request handling in `libs/utils/requests.ts`.
- Support methods: `sendGetRequest`, `sendPostRequest`, `sendPutRequest`, `sendPatchRequest`, and `sendDeleteRequest`.
- Include optional headers and status handling.

### Assertions
- Use a shared assertions module like `libs/utils/assertions.ts`.
- Include helpers for:
  - status code checks
  - success checks
  - template-based response validation
  - partial response matching

### Fixtures
- Store JSON fixtures in `test_data/<resource>/`.
- Separate request and response fixtures.
- Load fixtures with a utility like `readTestDataJson()`.
- Use fixtures in both wrapper initialization and test specs.

### Tests
- Store tests in `spec/api/`.
- Each test should be independent and create its own required data.
- Avoid `test.describe.serial` unless sharing state is unavoidable.
- Prefer fresh resources rather than reusing IDs between tests.
- Validate both status codes and response payload structure.

## Agent Behavior

When asked to generate API automation code:
1. Identify the API endpoints and expected request/response schemas.
2. Create or extend a wrapper in `libs/`.
3. Add JSON fixtures in `test_data/<resource>/`.
4. Add or update a spec in `spec/api/`.
5. Use centralized request and assertion helpers.
6. Keep code TypeScript-safe and consistent.

## Standalone Usage

This package is designed as a self-contained agent guide. It can be shared or published separately from any specific repository.
- No repository-specific paths should be included.
- The prompt and instructions are generic enough to adapt to similar Playwright API automation projects.

## Example request to an AI assistant

> Create a new Playwright API wrapper and test spec for a booking endpoint. Use request fixtures and response template validation. Do not modify unrelated configuration files.
