// apiTracker.ts - Tracks API calls for debugging
import { APIResponse } from '@playwright/test';

export interface ApiCall {
  method: string;
  url: string;
  response: APIResponse;
}

export let lastApiCall: ApiCall | null = null;

export const trackApiCall = (
  method: string,
  url: string,
  response: APIResponse
) => {
  lastApiCall = { method, url, response };
};
