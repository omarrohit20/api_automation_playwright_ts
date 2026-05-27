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

export function verifyResponseMatchExpected(actualResponse: any, expectedResponse: any): void {
  if (Array.isArray(actualResponse) && Array.isArray(expectedResponse)) {
    if (expectedResponse.length === 1) {
      const template = expectedResponse[0];
      actualResponse.forEach((actual, index) => {
        compareResponseHashes(actual, template, `[${index}]`);
      });
    } else {
      actualResponse.forEach((actual, index) => {
        compareResponseHashes(actual, expectedResponse[index], `[${index}]`);
      });
      expectedResponse.forEach((expected, index) => {
        compareResponseHashes(actualResponse[index], expected, `[${index}]`);
      });
    }
  } else {
    compareResponseHashes(actualResponse, expectedResponse);
  }
}

function compareResponseHashes(
  actualHash: unknown,
  expectedHash: unknown,
  path: string = 'root'
): void {
  // ✅ Skip handling
  if (expectedHash === 'skip') {
    return;
  }

  // ✅ Primitive values
  if (
    typeof actualHash !== 'object' ||
    actualHash === null ||
    typeof expectedHash !== 'object' ||
    expectedHash === null
  ) {
    const message = `${path} is wrong! actual: ${actualHash} expected: ${expectedHash}`;
    compareValues(actualHash, expectedHash, message);
    return;
  }

  // ✅ Array handling
  if (Array.isArray(actualHash) && Array.isArray(expectedHash)) {
    expect(Array.isArray(actualHash)).toBe(true);
    expect(Array.isArray(expectedHash)).toBe(true);

    const actualArr = actualHash as unknown[];
    const expectedArr = expectedHash as unknown[];

    if (expectedArr.length === 1) {
      const template = expectedArr[0];
      actualArr.forEach((item, index) => {
        compareResponseHashes(item, template, `${path}[${index}]`);
      });
    } else {
      actualArr.forEach((item, index) => {
        compareResponseHashes(item, expectedArr[index], `${path}[${index}]`);
      });
    }

    return;
  }

  // ✅ Object handling
  const actualObj = actualHash as Record<string, unknown>;
  const expectedObj = expectedHash as Record<string, unknown>;

  // 🔴 ASSERT missing keys
  for (const key of Object.keys(expectedObj)) {
    if (!(key in actualObj)) {
      console.error('❌ MISSING KEY FOUND');
      console.error(`Path: ${path}.${key}`);
      console.error(`Expected: ${JSON.stringify(expectedObj[key])}`);
      throw new Error(
        `❌ MISSING KEY at ${path}.${key} | expected value: ${JSON.stringify(expectedObj[key])}`
      );
    }
  }

  // ✅ Iterate through all keys
  for (const key of Object.keys(expectedObj)) {
    const expectedValue = expectedObj[key];
    const actualValue = actualObj[key];

    if (typeof expectedValue === 'string' && expectedValue === 'should_not_be_null') {
      expect(actualValue).not.toBeNull();
      expect(actualValue).toBeDefined();
    } else if (typeof expectedValue === 'string' && expectedValue === 'only_chars') {
      expect(typeof actualValue).toBe('string');
      expect(/^[a-zA-Z\s]+$/.test(String(actualValue))).toBe(true);
    } else if (typeof expectedValue === 'string' && expectedValue.startsWith('match_regex:')) {
      const regexStr = expectedValue.replace('match_regex:', '').slice(1, -1);
      const regex = new RegExp(regexStr);
      expect(regex.test(String(actualValue))).toBe(true);
    } else {
      compareResponseHashes(actualValue, expectedValue, `${path}.${key}`);
    }
  }
}

function compareValues(actual: unknown, expected: unknown, message: string): void {
  if (typeof expected === 'string' && expected === 'should_not_be_null') {
    expect(actual).not.toBeNull();
    expect(actual).toBeDefined();
  } else if (typeof expected === 'string' && expected === 'only_chars') {
    expect(typeof actual).toBe('string');
    expect(/^[a-zA-Z\s]+$/.test(String(actual))).toBe(true);
  } else if (typeof expected === 'string' && expected.startsWith('match_regex:')) {
    const regexStr = expected.replace('match_regex:', '').slice(1, -1);
    const regex = new RegExp(regexStr);
    expect(regex.test(String(actual))).toBe(true);
  } else {
    expect(actual).toEqual(expected);
  }
}
