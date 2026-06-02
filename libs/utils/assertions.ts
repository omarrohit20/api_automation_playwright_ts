// assertions.ts - Assertion utilities for API testing
import { APIResponse, expect } from '@playwright/test';
import { lastApiCall } from './apiTracker';

export async function verifyResponse(
  response: APIResponse,
  expectedResponse: any,
  expectedResponseCode: number
): Promise<void> {
  verifyResponseCode(response, expectedResponseCode);
  const body = await response.json();
  expect(body).toEqual(expectedResponse);
}

export function verifyResponseCode(response: APIResponse, expectedResponseCode: number): void {
  expect(response.status()).toBe(expectedResponseCode);
}

export function verifyResponseIsSuccessful(response: APIResponse): void {
  expect(response.status()).toBe(200);
}

export function verifyResponseIsSuccessfulCreateEntity(response: APIResponse): void {
  expect(response.status()).toBe(201);
}

export function verifyResponseMessageEquals(response: any, message: string): void {
  const messageJson = JSON.parse(message);
  expect(response).toEqual(messageJson);
}

export function verifyResponseMessageIncludes(response: any, message: string): void {
  const messageJson = JSON.parse(message);
  expect(response).toMatchObject(messageJson);
}

export async function verifyResponseTemplate(
  response: APIResponse,
  expectedResponse: any,
  expectedResponseCode: number
): Promise<void> {
  try {
    verifyResponseCode(response, expectedResponseCode);
    const body = await response.json();
    verifyResponseMatchExpected(body, expectedResponse);
  } catch (error) {
    console.error('❌ API ASSERTION FAILED');
    console.error(`METHOD: ${lastApiCall?.method ?? 'unknown'}`);
    console.error(`URL: ${lastApiCall?.url ?? 'unknown'}`);
    console.error('RESPONSE BODY:');
    try {
      const body = await response.json();
      console.error(JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('Unable to serialize response body');
    }
    console.error('❌ FULL ERROR:', error);
    throw error;
  }
}

export function verifyResponseMatchExpected(
  actualResponse: unknown,
  expectedResponse: unknown
): void {
  if (Array.isArray(actualResponse) && Array.isArray(expectedResponse)) {
    actualResponse.forEach((actual, index) => {
      compareResponseHashes(actual, expectedResponse[index])
    })

    expectedResponse.forEach((expected, index) => {
      compareResponseHashes(actualResponse[index], expected)
    })
  } else {
    compareResponseHashes(actualResponse, expectedResponse)
  }
}

/* -------------------------------------------------------------------------- */
/*                        DEEP COMPARISON ENGINE                               */
/* -------------------------------------------------------------------------- */

function compareResponseHashes(
  actualHash: unknown,
  expectedHash: unknown,
  path = 'root'
): void {
  // ✅ skip flag
  if (expectedHash === 'skip') {
    return
  }

  // ✅ primitive comparison
  if (
    typeof actualHash !== 'object' ||
    actualHash === null ||
    typeof expectedHash !== 'object' ||
    expectedHash === null
  ) {
    compareValues(actualHash, expectedHash, path)
    return
  }

  // ✅ array comparison
  if (Array.isArray(actualHash) && Array.isArray(expectedHash)) {
    if (actualHash.length !== expectedHash.length) {
      throw new Error(
        `[SCHEMA MISMATCH] ARRAY LENGTH MISMATCH at ${path}. Expected ${expectedHash.length}, got ${actualHash.length}`
      )
    }

    actualHash.forEach((item, index) => {
      compareResponseHashes(
        item,
        expectedHash[index],
        `${path}[${index}]`
      )
    })
    return
  }

  // ✅ object comparison
  const actualObj = actualHash as Record<string, unknown>
  const expectedObj = expectedHash as Record<string, unknown>

  // 🔴 Missing keys
  Object.keys(expectedObj).forEach((key) => {
    if (!(key in actualObj)) {
      throw new Error(
        `[SCHEMA MISMATCH]
Path      : ${path}.${key}
Problem   : Missing key in response
Expected  : ${JSON.stringify(expectedObj[key], null, 2)}
`
      )
    }
  })

  // 🔴 Unexpected keys
//   Object.keys(actualObj).forEach((key) => {
//     if (!(key in expectedObj)) {
//       throw new Error(
//         `[SCHEMA MISMATCH]
// Path      : ${path}.${key}
// Problem   : Unexpected key in response
// Actual    : ${JSON.stringify(actualObj[key], null, 2)}
// `
//       )
//     }
//   })

  // ✅ deep compare
  Object.keys(expectedObj).forEach((key) => {
    compareResponseHashes(
      actualObj[key],
      expectedObj[key],
      `${path}.${key}`
    )
  })
}

/* -------------------------------------------------------------------------- */
/*                              VALUE MATCHING                                */
/* -------------------------------------------------------------------------- */

function compareValues(
  actual: unknown,
  expected: unknown,
  path: string
): void {
  if (typeof expected === 'string') {
    handleExpectedString(actual, expected, path)
    return
  }


  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `[VALUE MISMATCH]
Path     : ${path}
Expected : ${JSON.stringify(expected)}
Actual   : ${JSON.stringify(actual)}
 
`
    )
  }
}

function handleExpectedString(
  actual: unknown,
  expected: string,
  path: string
): void {
  const actualValue = String(actual)

  if (expected.includes('match_regex')) {
    const match = expected.match(/\/(.+)\//)
    if (!match) {
      throw new Error(`Invalid regex at ${path}`)
    }
    const re = new RegExp(match[1])
    expect(actualValue).toMatch(re)
    return
  }

  switch (expected) {
    case 'only_digits':
      expect(actualValue).toMatch(/^\d+$/)
      break

    case 'only_chars':
      expect(actualValue).toMatch(/^[a-zA-Z]+$/)
      break

    case 'should_not_be_null':
      expect(actual).not.toBeNull()
      break

    case 'skip':
      break

    default:
      expect(actual).toEqual(expected)
  }
}
