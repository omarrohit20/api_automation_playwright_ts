# Playwright API Automation Framework

This is an API automation framework built with [Playwright](https://playwright.dev/) and TypeScript, designed to test RESTful APIs efficiently.

## Overview

This framework provides a robust structure for testing API endpoints with:
- **Async/Await Support**: Native async/await syntax for cleaner test code
- **TypeScript Support**: Full type safety and better IDE support
- **Multiple Browser Engines**: Run tests on Chromium, Firefox, and WebKit
- **Parallel Execution**: Built-in parallel test execution
- **Comprehensive Reporting**: HTML reports with detailed test results
- **Request Context**: Reusable API request context for efficient testing
- **Custom Assertions**: Template-based response validation

## Project Structure

```
spec/
├── api/                          # End-to-end tests
│   ├── users.spec.ts             # Users API tests
│   └── dotesthere-api.spec.ts    # DoTestHere API tests
libs/                            # Reusable helper libraries
│   ├── users.ts                  # Users API wrapper class
│   └── utils/                    # Shared helper utilities
│       ├── requests.ts           # HTTP request wrapper
│       ├── assertions.ts         # Custom assertion helpers
│       ├── apiTracker.ts         # API call tracking
│       └── common.ts             # Common utility functions
test_data/                       # Test data and fixtures
│   ├── users.json
│   ├── dotesthere-users.json
│   └── hosts.json
global-setup.ts                   # Global test setup
playwright.config.ts              # Playwright configuration
package.json                      # Dependencies and scripts
tsconfig.json                     # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Verify Playwright browsers are installed:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (with UI)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests in UI mode (Playwright Inspector)
```bash
npm run test:ui
```

### View test reports
```bash
npm run test:report
```

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Test Directory**: `./spec`
- **Base URL**: `https://jsonplaceholder.typicode.com`
- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 30 seconds per test
- **Retries**: 0 (2 on CI)
- **Workers**: Parallel execution enabled

### Environment Configuration

Configure API endpoints in the test setup:

```typescript
const context = await playwright.request.newContext({
  baseURL: 'https://dotesthere.com'
});
```

## Key Features

### 1. **Request Wrapper** (`libs/utils/requests.ts`)

Simplified HTTP request methods:
- `sendGetRequest()` - GET requests
- `sendPostRequest()` - POST requests
- `sendPutRequest()` - PUT requests
- `sendPatchRequest()` - PATCH requests
- `sendDeleteRequest()` - DELETE requests

### 2. **Users API Wrapper** (`libs/users.ts`)

Class-based wrapper for Users API endpoints:
```typescript
const users = new Users(context, baseUrl);
await users.getUsersList(page, limit);
await users.getUserDotesthere(id);
await users.postUserDotesthere(userData);
```

### 3. **Custom Assertions** (`libs/utils/assertions.ts`)

Template-based response validation:
- `verifyResponseCode()` - Check status code
- `verifyResponseTemplate()` - Validate response structure
- `verifyResponseMatchExpected()` - Match response with template

Special template values:
- `"skip"` - Skip validation for this field
- `"should_not_be_null"` - Value must exist and not be null
- `"only_chars"` - Value must contain only alphabetic characters
- `"match_regex:/<pattern>/"` - Value must match regex pattern

### 4. **API Tracking** (`libs/utils/apiTracker.ts`)

Track API calls for debugging:
```typescript
import { lastApiCall } from '../../libs/utils/apiTracker';

// Access last API call
console.log(lastApiCall?.method);
console.log(lastApiCall?.url);
console.log(lastApiCall?.response);
```

## Test Examples

### Basic GET Request
```typescript
test('Should retrieve users list', async () => {
  const response = await users.getUsersList(1, 10);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data).toBeInstanceOf(Array);
});
```

### POST Request with Response Validation
```typescript
test('Create a new user', async () => {
  const newUser = { name: 'John', job: 'Developer' };
  const response = await users.postUserDotesthere(newUser);
  
  const expectedResponse = { 
    name: newUser.name, 
    job: newUser.job, 
    id: 'should_not_be_null' 
  };
  await verifyResponseTemplate(response, expectedResponse, 201);
});
```

### Template-Based Validation
```typescript
test('Verify response structure', async () => {
  const response = await users.getUsersList(1, 10);
  
  const template = {
    page: 1,
    total: 'should_not_be_null',
    data: [{
      id: 'should_not_be_null',
      email: 'match_regex:/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/',
      first_name: 'only_chars'
    }]
  };
  
  await verifyResponseTemplate(response, template, 200);
});
```

## Migration from Cypress

This framework was migrated from Cypress to Playwright. Key differences:

| Feature | Cypress | Playwright |
|---------|---------|-----------|
| **Syntax** | Promise chains with `.then()` | Async/await |
| **Test Framework** | Mocha | Playwright Test |
| **API Testing** | `cy.request()` | `APIRequestContext.fetch()` |
| **Assertions** | Chai `.to.eq()` | Playwright `expect()` |
| **Configuration** | `cypress.config.ts` | `playwright.config.ts` |
| **Execution** | Sequential by default | Parallel by default |

### Syntax Changes

**Cypress (Before)**:
```typescript
it('test name', () => {
  users.getUsersList(1, 10).then((response) => {
    expect(response.status).to.eq(200);
  });
});
```

**Playwright (After)**:
```typescript
test('test name', async () => {
  const response = await users.getUsersList(1, 10);
  expect(response.status()).toBe(200);
});
```

## Debugging

### Enable Playwright Inspector
```bash
npm run test:debug
```

### View Trace Files
Playwright creates trace files for failed tests in `.playwright/trace/`.

### Print Debug Info
```typescript
import { test } from '@playwright/test';

test('debug test', async ({ page, request }) => {
  const response = await request.get('/api/users');
  console.log('Status:', response.status());
  console.log('Body:', await response.json());
});
```

## Performance

- **Parallel Execution**: Tests run in parallel by default (configurable workers)
- **Reusable Request Context**: Single context for all tests in a test suite
- **Efficient Resource Usage**: Lightweight compared to Cypress
- **Fast Execution**: Average test execution time < 1 second

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests fail with connection refused
- Verify API endpoint is running and accessible
- Check baseURL in playwright.config.ts
- Verify network connectivity

### Timeout errors
- Increase timeout in playwright.config.ts
- Check API response times
- Review network conditions

### Type errors with TypeScript
- Ensure TypeScript types are installed: `npm install --save-dev @types/node`
- Run `npx tsc --noEmit` to check for type errors

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Debugging](https://playwright.dev/docs/debug)

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use the Users API wrapper for API calls
3. Use template-based assertions
4. Document test purpose with clear descriptions
5. Keep tests independent and idempotent

## License

ISC