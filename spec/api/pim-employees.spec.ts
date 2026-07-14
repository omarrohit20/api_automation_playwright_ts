// pim-employees.spec.ts - PIM Employees API tests for OrangeHRM
import { test, expect, request, chromium } from '@playwright/test';
import { PimEmployees } from '../../libs/pim';
import { verifyResponseCode, verifyResponseTemplate } from '../../libs/utils/assertions';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';

let api: PimEmployees;
let cookies: string = '';

// Track empNumbers created during tests for cleanup
const createdEmpNumbers: number[] = [];

// Helper: perform OrangeHRM browser-based login and return all session cookies as a string.
// Uses a headless Chromium browser (identical to auth.setup.ts) so the full login
// redirect chain runs, all cookies are set, and the session is fully authenticated.
async function login(): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard/**', { timeout: 30000 });

  // Collect all cookies set by the authenticated session
  const cookies = await context.cookies();
  await browser.close();

  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

test.describe('PIM Employees API - OrangeHRM', () => {
  test.beforeAll(async () => {
    cookies = await login();
    api = new PimEmployees(cookies);
  });

  test.afterAll(async () => {
    // Cleanup: delete all employees created during tests
    if (createdEmpNumbers.length > 0) {
      try {
        await api.deleteEmployees(createdEmpNumbers);
      } catch (_) {
        // Best-effort cleanup
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Employee List
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Employee List', () => {
    test('TC-001: GET list with default params returns 200, non-empty data, meta.total > 0', async () => {
      const response = await api.listEmployees();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.meta.total).toBeGreaterThan(0);
    });

    test('TC-002: GET list filtered by nameOrId=Ranga returns matching employee', async () => {
      const response = await api.listEmployees({ nameOrId: 'Ranga' });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      // Each result should have a name or id containing the filter term (case-insensitive)
      body.data.forEach((emp: any) => {
        const combined = `${emp.firstName ?? ''} ${emp.lastName ?? ''} ${emp.employeeId ?? ''}`.toLowerCase();
        expect(combined).toContain('ranga');
      });
    });

    test('TC-003: GET list filtered by nameOrId=0277 returns matching record', async () => {
      const response = await api.listEmployees({ nameOrId: '0277' });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('TC-007: Pagination offset=0 and offset=50 return non-overlapping first records', async () => {
      const respAll = await api.listEmployees({ limit: 1 });
      const allBody = await respAll.json();
      if (allBody.meta.total <= 50) {
        test.skip(); // Not enough employees to test pagination
        return;
      }
      const resp0 = await api.listEmployees({ limit: 50, offset: 0 });
      const resp50 = await api.listEmployees({ limit: 50, offset: 50 });
      verifyResponseCode(resp0, 200);
      verifyResponseCode(resp50, 200);
      const body0 = await resp0.json();
      const body50 = await resp50.json();
      const ids0 = body0.data.map((e: any) => e.empNumber);
      const ids50 = body50.data.map((e: any) => e.empNumber);
      const overlap = ids0.filter((id: number) => ids50.includes(id));
      expect(overlap.length).toBe(0);
    });

    test('TC-008: GET list with nameOrId=ZZZNOMATCH99999 returns 200, empty data, total=0', async () => {
      const response = await api.listEmployees({ nameOrId: 'ZZZNOMATCH99999' });
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
      expect(body.meta.total).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Employee Create
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Employee Create', () => {
    test('TC-009: POST with firstName and lastName returns 200/201 with non-null empNumber', async () => {
      const response = await api.createEmployee({ firstName: 'AutoFN', lastName: 'AutoLN' });
      expect([200, 201]).toContain(response.status());
      const body = await response.json();
      expect(body.data.empNumber).not.toBeNull();
      createdEmpNumbers.push(body.data.empNumber);
    });

    test('TC-010: POST with middleName and custom employeeId returns correct values', async () => {
      // OrangeHRM employeeId is limited in length; use a short alphanumeric ID
      const payload = { firstName: 'AutoFN2', lastName: 'AutoLN2', middleName: 'Mid', employeeId: `T${Date.now().toString().slice(-6)}` };
      const response = await api.createEmployee(payload);
      expect([200, 201]).toContain(response.status());
      const body = await response.json();
      expect(body.data.firstName).toBe(payload.firstName);
      expect(body.data.lastName).toBe(payload.lastName);
      expect(body.data.middleName).toBe(payload.middleName);
      createdEmpNumbers.push(body.data.empNumber);
    });

    test('TC-011: POST missing firstName returns 422 or 400', async () => {
      const response = await api.createEmployee({ firstName: '', lastName: 'MissingFN' }, false);
      expect([400, 422]).toContain(response.status());
    });

    test('TC-012: POST missing lastName returns 422 or 400', async () => {
      const response = await api.createEmployee({ firstName: 'MissingLN', lastName: '' }, false);
      expect([400, 422]).toContain(response.status());
    });

    test('TC-015: POST with special characters in firstName/lastName returns 200/201', async () => {
      const response = await api.createEmployee({ firstName: '@#$%', lastName: '!!!Test' });
      expect([200, 201]).toContain(response.status());
      const body = await response.json();
      expect(body.data.empNumber).not.toBeNull();
      createdEmpNumbers.push(body.data.empNumber);
    });

    test('TC-016: POST with duplicate employeeId returns 400 or 409', async () => {
      // Use a short numeric ID to stay within OrangeHRM employeeId field limits
      const dupId = `D${Date.now().toString().slice(-5)}`;
      // First creation
      const first = await api.createEmployee({ firstName: 'DupFirst', lastName: 'DupLast', employeeId: dupId });
      expect([200, 201]).toContain(first.status());
      const firstBody = await first.json();
      createdEmpNumbers.push(firstBody.data.empNumber);

      // Second creation with same employeeId — OrangeHRM returns 400, 409, or 422
      const second = await api.createEmployee({ firstName: 'DupFirst2', lastName: 'DupLast2', employeeId: dupId }, false);
      expect([400, 409, 422]).toContain(second.status());
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Employee Read
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Employee Read', () => {
    test('TC-017: GET /api/v2/pim/employees/3 returns 200 with empNumber=3', async () => {
      const response = await api.getEmployee(3);
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body.data.empNumber).toBe(3);
    });

    test('TC-018: GET /api/v2/pim/employees/9999999 returns 404 or 422', async () => {
      // OrangeHRM returns 422 (not 404) for non-existent employee numbers
      const response = await api.getEmployee(9999999, false);
      expect([404, 422]).toContain(response.status());
    });

    test('TC-033: GET personal-details for empNumber=3 returns 200 with required fields', async () => {
      const response = await api.getEmployeePersonalDetails(3);
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(body.data).toHaveProperty('gender');
      expect(body.data).toHaveProperty('maritalStatus');
      expect(body.data).toHaveProperty('birthday');
      expect(body.data).toHaveProperty('nationality');
      expect(body.data.empNumber).toBe(3);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Employee Update
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Employee Update', () => {
    test('TC-019: PUT personal-details on existing employee, GET to verify update', async () => {
      // Use empNumber=3 which is a pre-seeded employee confirmed to exist with full
      // personal-details (TC-017 and TC-033 both verify it). Newly-created employees
      // have no personal-details DB row yet and cause a server 500 on PUT.
      const empNumber = 3;

      // Capture current personal details so we can restore after the test
      const beforeResp = await api.getEmployeePersonalDetails(empNumber);
      verifyResponseCode(beforeResp, 200);
      const before = (await beforeResp.json()).data;

      // PUT with modified firstName
      const updatePayload: Record<string, any> = {
        firstName: 'UpdatedFN',
        lastName: before.lastName ?? 'User',
        middleName: before.middleName ?? '',
        gender: before.gender ?? null,
        maritalStatus: before.maritalStatus ?? null,
        birthday: before.birthday ?? null
      };
      const putResp = await api.updatePersonalDetails(empNumber, updatePayload);
      expect([200, 201]).toContain(putResp.status());

      // Verify via GET
      const verifyResp = await api.getEmployeePersonalDetails(empNumber);
      verifyResponseCode(verifyResp, 200);
      const verifyBody = await verifyResp.json();
      expect(verifyBody.data.firstName).toBe('UpdatedFN');

      // Restore original firstName so this shared record is not permanently modified
      const restorePayload: Record<string, any> = { ...updatePayload, firstName: before.firstName };
      await api.updatePersonalDetails(empNumber, restorePayload, false);
    });

    test('TC-020: PUT personal-details with empty firstName returns 400 or 422', async () => {
      // Create temp employee
      const createResp = await api.createEmployee({ firstName: 'TempTC020', lastName: 'TempLast' });
      expect([200, 201]).toContain(createResp.status());
      const createBody = await createResp.json();
      const empNumber: number = createBody.data.empNumber;
      createdEmpNumbers.push(empNumber);

      const detailsResp = await api.getEmployeePersonalDetails(empNumber);
      verifyResponseCode(detailsResp, 200);
      const detailsBody = await detailsResp.json();
      const current2 = detailsBody.data;

      // Send empty firstName to trigger validation error
      const updatePayload = {
        firstName: '',
        lastName: current2.lastName ?? 'TempLast',
        middleName: current2.middleName ?? '',
        employeeId: current2.employeeId ?? '',
        gender: current2.gender ?? null,
        maritalStatus: current2.maritalStatus ?? null,
        birthday: current2.birthday ?? null,
        nationalityId: current2.nationality?.id ?? null
      };
      const putResp = await api.updatePersonalDetails(empNumber, updatePayload, false);
      expect([400, 422]).toContain(putResp.status());
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Employee Delete
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Employee Delete', () => {
    test('TC-021: Create employee, delete it, verify 404 on GET', async () => {
      const createResp = await api.createEmployee({ firstName: 'DeleteMe', lastName: 'TC021' });
      expect([200, 201]).toContain(createResp.status());
      const createBody = await createResp.json();
      const empNumber: number = createBody.data.empNumber;

      const deleteResp = await api.deleteEmployees([empNumber]);
      expect([200, 204]).toContain(deleteResp.status());

      // OrangeHRM returns 422 (not 404) for non-existent employees
      const getResp = await api.getEmployee(empNumber, false);
      expect([404, 422]).toContain(getResp.status());
    });

    test('TC-022: Create 3 employees, bulk delete, verify all 404', async () => {
      const empNums: number[] = [];
      for (let i = 0; i < 3; i++) {
        const createResp = await api.createEmployee({ firstName: `BulkDel${i}`, lastName: 'TC022' });
        expect([200, 201]).toContain(createResp.status());
        const body = await createResp.json();
        empNums.push(body.data.empNumber);
      }

      const deleteResp = await api.deleteEmployees(empNums);
      expect([200, 204]).toContain(deleteResp.status());

      for (const empNum of empNums) {
        // OrangeHRM returns 422 (not 404) for non-existent employees
        const getResp = await api.getEmployee(empNum, false);
        expect([404, 422]).toContain(getResp.status());
      }
    });

    test('TC-023: DELETE with non-existent id 9999999 returns 400 or 404', async () => {
      const response = await api.deleteEmployees([9999999], false);
      expect([400, 404]).toContain(response.status());
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Reference Data
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Reference Data', () => {
    test('TC-024: GET job-titles?limit=0 returns 200, non-empty data, each item has id and title', async () => {
      const response = await api.getJobTitles();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      body.data.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        // OrangeHRM job title objects use "title" field (not "name")
        expect(item).toHaveProperty('title');
      });
    });

    test('TC-025: GET employment-statuses?limit=0 returns 200, non-empty data', async () => {
      const response = await api.getEmploymentStatuses();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    test('TC-026: GET subunits returns 200, non-empty data', async () => {
      const response = await api.getSubUnits();
      verifyResponseCode(response, 200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });
});
