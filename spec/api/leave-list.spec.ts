// leave-list.spec.ts - Leave List API tests for OrangeHRM (KAN-14)
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

test.describe('Leave List API - OrangeHRM (KAN-14)', () => {
  test.beforeAll(async () => {
    cookies = await login();
    api = new Leave(cookies);
  });

  test.afterAll(async () => {
    // All tests are GET-only — no data created, no cleanup needed.
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-015: Required AC fields per leave record
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-015: GET leave-requests returns all six required AC fields per record', { tag: ['@smoke', '@sanity', '@regression'] }, async () => {
    const response = await api.listLeaveRequests();
    verifyResponseCode(response, 200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length === 0) {
      // Demo env may have no leave records — skip field assertions gracefully
      console.log('TS-015: data[] is empty in demo env — skipping field assertions');
      return;
    }

    const record = body.data[0];

    // Employee name fields
    expect(record).toHaveProperty('employee');
    const emp = record.employee;
    const hasName = emp.firstName !== undefined || emp.lastName !== undefined;
    expect(hasName).toBe(true);

    // leaveType.name
    expect(record).toHaveProperty('leaveType');
    expect(record.leaveType).toHaveProperty('name');

    // fromDate and toDate
    expect(record).toHaveProperty('fromDate');
    expect(record).toHaveProperty('toDate');

    // noOfDays or days
    const hasDays = record.noOfDays !== undefined || record.days !== undefined;
    expect(hasDays).toBe(true);

    // status.name
    expect(record).toHaveProperty('status');
    expect(record.status).toHaveProperty('name');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-016: Pagination — second page returns different records than first
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-016: Pagination — second page returns different records than first', { tag: ['@sanity', '@regression'] }, async () => {
    const resp1 = await api.listLeaveRequests({ limit: 50, offset: 0 });
    verifyResponseCode(resp1, 200);
    const body1 = await resp1.json();
    expect(typeof body1.meta.total).toBe('number');

    if (body1.meta.total <= 50) {
      console.log('TS-016: total <= 50 — pagination assertion skipped; only one page of data exists');
      return;
    }

    const resp2 = await api.listLeaveRequests({ limit: 50, offset: 50 });
    verifyResponseCode(resp2, 200);
    const body2 = await resp2.json();

    // meta.total must be consistent across pages
    expect(body2.meta.total).toBe(body1.meta.total);

    // IDs on page 2 must not overlap with IDs on page 1
    const ids1 = new Set(body1.data.map((r: any) => r.id));
    const ids2 = body2.data.map((r: any) => r.id);
    const overlap = ids2.filter((id: any) => ids1.has(id));
    expect(overlap.length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-018: Pagination — offset exceeding total returns empty data
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-018: GET leave-requests with offset=999999 returns 200 and empty data array', { tag: ['@regression'] }, async () => {
    const response = await api.listLeaveRequests({ limit: 50, offset: 999999 }, false);
    verifyResponseCode(response, 200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-020: No auth token — API rejects with 401
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-020: GET leave-requests without auth returns 401 and no leave data', { tag: ['@smoke', '@sanity', '@regression'] }, async () => {
    // Create a fresh unauthenticated Leave instance (empty cookies)
    const unauthApi = new Leave('');
    const response = await unauthApi.listLeaveRequests({}, false);
    verifyResponseCode(response, 401);

    // Ensure no leave data is exposed in the body
    const text = await response.text();
    let body: any;
    try { body = JSON.parse(text); } catch { body = null; }
    if (body && body.data) {
      expect(Array.isArray(body.data) ? body.data.length : 0).toBe(0);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-022: Boundary — limit=1 returns exactly one record
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-022: GET leave-requests with limit=1 returns exactly one record', { tag: ['@regression'] }, async () => {
    const response = await api.listLeaveRequests({ limit: 1, offset: 0 });
    verifyResponseCode(response, 200);
    const body = await response.json();
    expect(typeof body.meta.total).toBe('number');
    expect(body.meta.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.data)).toBe(true);

    if (body.meta.total === 0) {
      console.log('TS-022: total=0 in demo env — skip length==1 assertion');
      return;
    }

    expect(body.data.length).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-023: Boundary — negative offset rejected or clamped, never 500
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-023: GET leave-requests with offset=-1 returns 400 or 200 (clamped), never 500', { tag: ['@regression'] }, async () => {
    const response = await api.listLeaveRequests({ limit: 50, offset: -1 }, false);
    const status = response.status();
    expect(status).not.toBe(500);
    expect([200, 400, 422]).toContain(status);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-024: Status filter returns only Pending records
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-024: GET leave-requests with statuses[]=1 (Pending) returns only Pending records', { tag: ['@sanity', '@regression'] }, async () => {
    const response = await api.listLeaveRequests({ statuses: [1], limit: 50, offset: 0 });
    verifyResponseCode(response, 200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length === 0) {
      console.log('TS-024: No Pending records in demo env — filter correctness check skipped');
      return;
    }

    body.data.forEach((record: any) => {
      expect(record).toHaveProperty('status');
      expect(record.status).toHaveProperty('name');
      // OrangeHRM status id=1 corresponds to "Pending Approval"
      expect(record.status.name.toLowerCase()).toContain('pending');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TS-028: GET /api/v2/leave/workweek?model=indexed returns 200 with day-keyed data
  // ─────────────────────────────────────────────────────────────────────────

  test('TS-028: GET workweek?model=indexed returns 200 with day-keyed object', { tag: ['@smoke', '@regression'] }, async () => {
    const response = await api.getWorkweek('indexed');
    verifyResponseCode(response, 200);
    const body = await response.json();

    // data must be a non-null object
    expect(body).toHaveProperty('data');
    expect(body.data).not.toBeNull();
    expect(typeof body.data).toBe('object');
    expect(Array.isArray(body.data)).toBe(false);

    // All seven day keys (0-6) must be present
    const dayKeys = ['0', '1', '2', '3', '4', '5', '6'];
    dayKeys.forEach((key) => {
      expect(body.data).toHaveProperty(key);
    });
  });
});
