// requests.ts - Request helpers for Playwright API testing
import { APIRequestContext, APIResponse } from '@playwright/test';
import { trackApiCall, lastApiCall } from './apiTracker';

let token: string | undefined;
let authTokenCookie: string | undefined;

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: any;
  failOnStatusCode?: boolean;
}

export function headersCookiesManager(): { headers: Record<string, string> } {
  const headersToSend: Record<string, string> = {
    'content-type': 'application/json',
    'accept': 'application/json'
  };

  if (token) {
    headersToSend['authorization'] = `Bearer ${token}`;
  }

  return { headers: headersToSend };
}

export async function sendRequest(
  context: APIRequestContext,
  method: string,
  url: string,
  params: any = {},
  customHeaders?: Record<string, string>,
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  const { headers: headersToSend } = headersCookiesManager();
  const finalHeaders = customHeaders || headersToSend;

  const requestOptions: any = {
    headers: finalHeaders,
    ...params
  };

  try {
    const response = await context.fetch(url, {
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
      ...requestOptions
    });

    trackApiCall(method, url, response);

    if (!response.ok() && failOnStatusCode) {
      throw new Error(`HTTP ${response.status()}: ${await response.text()}`);
    }

    // Handle auth token updates
    if (response.status() === 200) {
      const setCookieHeader = response.headers()['set-cookie'];
      if (setCookieHeader && setCookieHeader.includes('authToken')) {
        const authTokenMatch = setCookieHeader.match(/authToken=([^;]+)/);
        if (authTokenMatch) {
          authTokenCookie = authTokenMatch[1];
        }
      }
    }

    return response;
  } catch (error) {
    console.error(`Request failed: ${method} ${url}`, error);
    throw error;
  }
}

export async function sendGetRequest(
  context: APIRequestContext,
  apiUrl: string,
  headers?: Record<string, string>,
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  return sendRequest(context, 'GET', apiUrl, { failOnStatusCode }, headers, failOnStatusCode);
}

export async function sendPostRequest(
  context: APIRequestContext,
  apiUrl: string,
  json?: any,
  headers?: Record<string, string>,
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  const payload = json ? (typeof json === 'object' ? json : JSON.parse(json)) : undefined;
  return sendRequest(
    context,
    'POST',
    apiUrl,
    { data: payload, failOnStatusCode },
    headers,
    failOnStatusCode
  );
}

export async function sendDeleteRequest(
  context: APIRequestContext,
  apiUrl: string,
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  return sendRequest(context, 'DELETE', apiUrl, { failOnStatusCode }, undefined, failOnStatusCode);
}

export async function sendPatchRequest(
  context: APIRequestContext,
  apiUrl: string,
  json: any,
  patchHeader: any = {},
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  const payload = json ? (typeof json === 'object' ? json : JSON.parse(json)) : undefined;
  return sendRequest(
    context,
    'PATCH',
    apiUrl,
    { data: payload, failOnStatusCode },
    patchHeader,
    failOnStatusCode
  );
}

export async function sendPutRequest(
  context: APIRequestContext,
  apiUrl: string,
  json: any,
  failOnStatusCode: boolean = true
): Promise<APIResponse> {
  const payload = json ? (typeof json === 'object' ? json : JSON.parse(json)) : undefined;
  return sendRequest(
    context,
    'PUT',
    apiUrl,
    { data: payload, failOnStatusCode },
    undefined,
    failOnStatusCode
  );
}

export async function getFile(
  context: APIRequestContext,
  apiUrl: string
): Promise<APIResponse> {
  return sendRequest(
    context,
    'GET',
    apiUrl,
    {},
    { 'accept': 'application/octet-stream' }
  );
}

export function printLastRequest(options: any): void {
  console.log('Last request:', options);
}

export function printLastResponse(response: APIResponse): void {
  console.log('Last response:', response);
}
