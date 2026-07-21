// admin-users.spec.ts - Admin Users API tests for OrangeHRM (KAN-15)
import { test, expect, chromium } from '@playwright/test';
import { AdminUsers } from '../../libs/admin-users';
import { verifyResponseCode, verifyResponseTemplate } from '../../libs/utils/assertions';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';

let api: AdminUsers;
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
  await page.waitForURL('**/dashboard/**', { timeout: 60000 });

  const allCookies = await context.cookies();
  await browser.close();

  return allCookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

test.describe('Admin Users API — KAN-15', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    cookies = await login();
    api = new AdminUsers(cookies);
  });

  test.afterAll(async () => {
    // All tests are GET-only — no data created, no cleanup needed.
  });

  // ─────────────────────────────────────────────────────────────────────────
  // KAN-16: View System Users
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('KAN-16: View System Users', () => {

    test(
      'TC-KAN16-01: GET /api/v2/admin/users returns records with all required AC fields',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async () => {
        const response = await api.listUsers();
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(typeof body.meta.total).toBe('number');
        expect(body.meta.total).toBeGreaterThan(0);

        const record = body.data[0];

        // userName must be a string
        expect(typeof record.userName).toBe('string');

        // userRole.displayName must be a string
        expect(record).toHaveProperty('userRole');
        expect(typeof record.userRole.displayName).toBe('string');

        // employee.firstName or employee.lastName must be a string
        expect(record).toHaveProperty('employee');
        const emp = record.employee;
        const hasName =
          (emp.firstName !== undefined && emp.firstName !== null) ||
          (emp.lastName !== undefined && emp.lastName !== null);
        expect(hasName).toBe(true);

        // status must be a boolean
        expect(typeof record.status).toBe('boolean');
      }
    );

    test(
      'TC-KAN16-02: GET /api/v2/admin/users with limit/offset — pagination returns distinct pages',
      { tag: ['@sanity', '@regression'] },
      async () => {
        const resp1 = await api.listUsers({ limit: 1, offset: 0 });
        verifyResponseCode(resp1, 200);
        const body1 = await resp1.json();

        expect(Array.isArray(body1.data)).toBe(true);
        expect(body1.data.length).toBe(1);

        if (body1.meta.total < 2) {
          console.log('TC-KAN16-02: total < 2 — second-page assertion skipped; not enough users');
          return;
        }

        const resp2 = await api.listUsers({ limit: 1, offset: 1 });
        verifyResponseCode(resp2, 200);
        const body2 = await resp2.json();

        expect(Array.isArray(body2.data)).toBe(true);
        expect(body2.data.length).toBe(1);

        // The two pages must return different users
        expect(body1.data[0].userName).not.toBe(body2.data[0].userName);
      }
    );

    test(
      'TC-KAN16-03: GET /api/v2/admin/users without auth returns 401',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async () => {
        const response = await api.listUsersUnauthenticated(false);
        verifyResponseCode(response, 401);
      }
    );

  });

  // ─────────────────────────────────────────────────────────────────────────
  // KAN-17: Search System Users
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('KAN-17: Search System Users', () => {

    test(
      'TC-KAN17-01: GET /api/v2/admin/users?username=Admin — search by username returns matching user',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async () => {
        const response = await api.listUsers({ username: 'Admin' });
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);

        body.data.forEach((record: any) => {
          expect(record.userName).toBe('Admin');
        });
      }
    );

    test(
      'TC-KAN17-02: GET /api/v2/admin/users?userRoleId=2 — search by ESS role returns only ESS users',
      { tag: ['@sanity', '@regression'] },
      async () => {
        const response = await api.listUsers({ userRoleId: 2 });
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(typeof body.meta.total).toBe('number');

        if (body.data.length === 0) {
          console.log('TC-KAN17-02: No ESS users found in demo env — role filter correctness check skipped');
          return;
        }

        body.data.forEach((record: any) => {
          expect(record).toHaveProperty('userRole');
          expect(record.userRole.displayName).toBe('ESS');
        });
      }
    );

    test(
      'TC-KAN17-03: GET /api/v2/admin/users?status=1 — search by Enabled status returns enabled users',
      { tag: ['@sanity', '@regression'] },
      async () => {
        const response = await api.listUsers({ status: 1 });
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);

        // status is boolean true in response even though query param is integer 1
        body.data.forEach((record: any) => {
          expect(record.status).toBe(true);
        });
      }
    );

    test(
      'TC-KAN17-04: GET /api/v2/admin/users?username=zzz_nonexistent_user_xyz — no results returns empty data',
      { tag: ['@smoke', '@sanity', '@regression'] },
      async () => {
        const response = await api.listUsers({ username: 'zzz_nonexistent_user_xyz' });
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(0);
        expect(body.meta.total).toBe(0);
      }
    );

    test(
      'TC-KAN17-05: GET /api/v2/admin/users?username=Adm — partial username match behavior documented',
      { tag: ['@regression'] },
      async () => {
        const response = await api.listUsers({ username: 'Adm' });
        verifyResponseCode(response, 200);
        const body = await response.json();

        expect(Array.isArray(body.data)).toBe(true);
        expect(typeof body.meta.total).toBe('number');

        if (body.data.length > 0) {
          // If results are returned, every userName must contain 'Adm' (case-insensitive)
          body.data.forEach((record: any) => {
            expect(record.userName.toLowerCase()).toContain('adm');
          });
        } else {
          // API uses exact matching — partial search returned no results
          console.log('TC-KAN17-05: username=Adm returned 0 results — API uses exact (not partial) username matching');
        }
        // This test never fails — it documents the API matching behavior
      }
    );

  });

});
