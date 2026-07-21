// leave-search.spec.ts - Leave Search API tests for OrangeHRM (KAN-13)
import { test, expect, chromium } from '@playwright/test';
import { Leave } from '../../libs/leave';
import { verifyResponseCode, verifyResponseTemplate } from '../../libs/utils/assertions';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';

let api: Leave;
let cookies: string = '';

// Helper: perform OrangeHRM browser-based login and return all session cookies as a string.
// Uses a headless Chromium browser so the full login redirect chain runs, all cookies are set,
// and the session is fully authenticated.
async function login(): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard/**', { timeout: 30000 });

  const allCookies = await context.cookies();
  await browser.close();

  return allCookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

test.describe('Leave Search API - OrangeHRM', () => {
  test.beforeAll(async () => {
    cookies = await login();
    api = new Leave(cookies);
  });

  test.afterAll(async () => {
    // All tests are GET-only — no data created, no cleanup needed.
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Leave Requests Search
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Leave Requests Search', () => {
    test('TS-001: GET leave-requests with date range, status=Pending, includeEmployees=onlyCurrent returns 200 with valid structure', async () => {
      const response = await api.listLeaveRequests({
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        statuses: [1],
        limit: 50,
        offset: 0,
        includeEmployees: 'onlyCurrent'
      });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.meta.total).toBe('number');
      expect(body.meta.total).toBeGreaterThanOrEqual(0);
    });

    test('TS-002: GET leave-requests response has data array and meta.total fields', async () => {
      const response = await api.listLeaveRequests({
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        statuses: [1],
        limit: 50,
        offset: 0,
        includeEmployees: 'onlyCurrent'
      });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('meta');
      expect(body.meta).toHaveProperty('total');
      expect(typeof body.meta.total).toBe('number');
    });

    test('TS-003: GET leave-requests filtered by a valid leaveTypeId returns 200', async () => {
      // First fetch leave types to get a real leaveTypeId
      const typesResp = await api.getLeaveTypes();
      verifyResponseCode(typesResp, 200);
      const typesBody = await typesResp.json();
      expect(Array.isArray(typesBody.data)).toBe(true);
      expect(typesBody.data.length).toBeGreaterThan(0);

      const leaveTypeId: number = typesBody.data[0].id;

      const response = await api.listLeaveRequests({
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        statuses: [1],
        limit: 50,
        offset: 0,
        leaveTypeId
      });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.meta.total).toBe('number');
    });

    test('TS-004: GET leave-requests with narrow March date range returns 200 with valid JSON structure', async () => {
      const response = await api.listLeaveRequests({
        fromDate: '2025-03-01',
        toDate: '2025-03-31',
        statuses: [1]
      });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    test('TS-007: GET leave-requests with reversed dates returns 400/422 or 200 with empty data', async () => {
      const response = await api.listLeaveRequests({
        fromDate: '2025-12-31',
        toDate: '2025-01-01',
        statuses: [1]
      }, false);
      const status = response.status();
      if ([400, 422].includes(status)) {
        // API correctly rejected reversed date range
        expect([400, 422]).toContain(status);
      } else {
        // API returned 200 — assert empty result set
        expect(status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(0);
        expect(body.meta.total).toBe(0);
      }
    });

    test('TS-008: GET leave-requests with non-existent empNumber=999999 returns 200 with empty data or 422', async () => {
      // OrangeHRM validates empNumber and returns 422 when the employee does not exist,
      // consistent with how the PIM API handles non-existent employee numbers.
      const response = await api.listLeaveRequests({
        empNumber: 999999,
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        statuses: [1]
      }, false);
      const status = response.status();
      if (status === 200) {
        const body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(0);
        expect(body.meta.total).toBe(0);
      } else {
        // API rejected non-existent empNumber with a validation error
        expect([400, 422]).toContain(status);
      }
    });

    test('TS-009: GET leave-requests over Feb 2024 leap-year range must not return 500', async () => {
      const response = await api.listLeaveRequests({
        fromDate: '2024-02-01',
        toDate: '2024-02-29',
        statuses: [1]
      }, false);
      const status = response.status();
      // 500 is the only unacceptable outcome
      expect(status).not.toBe(500);
      // Accept 200, 400, or 422
      expect([200, 400, 422]).toContain(status);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Leave Reference Data
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Leave Reference Data', () => {
    test('TS-005: GET leave-types?limit=0 returns 200, non-empty data, each item has id and name', async () => {
      const response = await api.getLeaveTypes();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      body.data.forEach((item: any) => {
        expect(item.id).not.toBeNull();
        expect(item).toHaveProperty('name');
      });
    });

    test('TS-006: GET leave-periods returns 200, meta.leavePeriodDefined=true, currentLeavePeriod has startDate and endDate', async () => {
      const response = await api.getLeavePeriods();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body.meta.leavePeriodDefined).toBe(true);
      expect(body.meta.currentLeavePeriod).toHaveProperty('startDate');
      expect(body.meta.currentLeavePeriod).toHaveProperty('endDate');
      expect(body.meta.currentLeavePeriod.startDate).not.toBeNull();
      expect(body.meta.currentLeavePeriod.endDate).not.toBeNull();
    });

    test('TS-010: GET holidays for 2026 returns 200 with data array', async () => {
      const response = await api.getHolidays('2026-01-01', '2026-12-31');
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
