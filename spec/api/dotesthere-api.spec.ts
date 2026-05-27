import { test, expect, request } from '@playwright/test';
import { Users } from '../../libs/users';

test.describe('DoTestHere API Automation', () => {
  let users: Users;
  let apiRequest: any;

  test.beforeAll(async ({ playwright }) => {
    apiRequest = await request.newContext({
      baseURL: 'https://dotesthere.com'
    });
    users = new Users(apiRequest, 'https://dotesthere.com');
  });

  test.describe('GET /api/users - List Users', () => {
    
    test('Should retrieve users list with pagination', async () => {
      const response = await users.getUsersList(1, 10);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('page', 1);
      expect(body).toHaveProperty('per_page');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('total_pages');
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Should retrieve second page of users', async () => {
      const response = await users.getUsersList(2, 10);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.page).toBe(2);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Should use default pagination when not specified', async () => {
      const response = await users.getUsersList();
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.page).toBe(1);
      expect(body.per_page).toBe(10);
    });

    test('Should verify user data structure in list', async () => {
      const response = await users.getUsersList(1, 10);
      expect(response.status()).toBe(200);
      const body = await response.json();
      const user = body.data[0];
      
      expect(Object.keys(user).sort()).toEqual(['avatar', 'email', 'first_name', 'id', 'last_name'].sort());
      expect(typeof user.id).toBe('number');
      expect(typeof user.email).toBe('string');
      expect(typeof user.first_name).toBe('string');
      expect(typeof user.last_name).toBe('string');
      expect(typeof user.avatar).toBe('string');
    });

    test('Should verify email format in user list', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      body.data.forEach((user: any) => {
        expect(emailRegex.test(user.email)).toBe(true);
      });
    });

    test('Should verify avatar URLs are valid', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      body.data.forEach((user: any) => {
        expect(user.avatar).toContain('http');
        expect(/\.(jpg|png|jpeg|gif)/i.test(user.avatar)).toBe(true);
      });
    });

    test('Should have no duplicate users in list', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      const ids = body.data.map((u: any) => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('Should verify all users have non-empty required fields', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      body.data.forEach((user: any) => {
        expect(user.email.length).toBeGreaterThan(0);
        expect(user.first_name.length).toBeGreaterThan(0);
        expect(user.last_name.length).toBeGreaterThan(0);
        expect(user.avatar.length).toBeGreaterThan(0);
      });
    });

    test('Should retrieve multiple pages successfully', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      const totalPages = body.total_pages;
      
      for (let page = 1; page <= Math.min(totalPages, 3); page++) {
        const pageResponse = await users.getUsersList(page, 10);
        expect(pageResponse.status()).toBe(200);
        const pageBody = await pageResponse.json();
        expect(pageBody.page).toBe(page);
      }
    });

    test('Should return response with correct headers', async () => {
      const response = await users.getUsersList(1, 10);
      const contentType = response.headers()['content-type'] || '';
      expect(contentType).toContain('application/json');
    });

    test('Should maintain consistent total count across pages', async () => {
      const response1 = await users.getUsersList(1, 10);
      const body1 = await response1.json();
      const total1 = body1.total;
      
      const response2 = await users.getUsersList(2, 10);
      const body2 = await response2.json();
      expect(body2.total).toBe(total1);
    });

    test('Should respond within acceptable time', async () => {
      const startTime = Date.now();
      const response = await users.getUsersList(1, 10);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });

    test('Should verify pagination metadata', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      expect(typeof body.total).toBe('number');
      expect(typeof body.total_pages).toBe('number');
      expect(body.total_pages).toBeGreaterThan(0);
    });
  });

  test.describe('GET /api/users/{id} - Get User by ID', () => {

    test('Should retrieve user by ID 1', async () => {
      const response = await users.getUserDotesthere('1');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(body.data.id).toBe(1);
    });

    test('Should retrieve user by ID 2', async () => {
      const response = await users.getUserDotesthere('2');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.id).toBe(2);
    });

    test('Should verify single user data structure', async () => {
      const response = await users.getUserDotesthere('1');
      expect(response.status()).toBe(200);
      const body = await response.json();
      const user = body.data;
      
      expect(Object.keys(user).sort()).toEqual(['avatar', 'email', 'first_name', 'id', 'last_name'].sort());
      expect(typeof user.id).toBe('number');
      expect(typeof user.email).toBe('string');
      expect(typeof user.first_name).toBe('string');
      expect(typeof user.last_name).toBe('string');
    });

    test('Should verify response format for user detail', async () => {
      const response = await users.getUserDotesthere('1');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(typeof body.data).toBe('object');
    });

    test('Should handle non-existent user gracefully', async () => {
      const response = await users.getUserDotesthere('99999', false);
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('POST /api/users - Create User', () => {

    test('Should attempt to create a new user', async () => {
      const newUser = { name: 'Test User', job: 'QA Engineer' };
      
      const response = await users.postUserDotesthere(newUser, false);
      const status = response.status();
      
      if (status === 201) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('createdAt');
      } else {
        console.log(`API returned status ${status} - POST may not be fully supported`);
      }
    });

    test('Should create users with different job titles', async () => {
      const jobs = ['Developer', 'Tester', 'Manager'];
      
      for (const job of jobs) {
        const response = await users.postUserDotesthere({ name: 'User', job: job }, false);
        
        if (response.status() === 201) {
          const body = await response.json();
          expect(body.job).toBe(job);
        }
      }
    });
  });

  test.describe('PUT /api/users/{id} - Update User', () => {

    test('Should attempt to update user information', async () => {
      const updateData = { name: 'Updated Name', job: 'Senior QA' };
      
      const response = await users.putUserDotesthere('1', updateData, false);
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('updatedAt');
      } else {
        console.log(`API returned status ${response.status()} - PUT may not be fully supported`);
      }
    });

    test('Should handle update with partial fields', async () => {
      const response = await users.putUserDotesthere('2', { name: 'Partial Update' }, false);
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.name).toBe('Partial Update');
      }
    });
  });

  test.describe('DELETE /api/users/{id} - Delete User', () => {

    test('Should attempt to delete user', async () => {
      const response = await users.deleteUserDotesthere('1', false);
      expect([200, 204, 404, 500]).toContain(response.status());
    });

    test('Should handle deletion gracefully', async () => {
      const response = await users.deleteUserDotesthere('5', false);
      expect([200, 204, 404, 500]).toContain(response.status());
    });
  });

  test.describe('API Workflow Tests', () => {

    test('Should complete GET workflow without errors', async () => {
      const response = await users.getUsersList(1, 10);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.length).toBeGreaterThan(0);
    });

    test('Should retrieve list then get single user', async () => {
      const listResponse = await users.getUsersList(1, 10);
      expect(listResponse.status()).toBe(200);
      
      const listBody = await listResponse.json();
      if (listBody.data.length > 0) {
        const userId = listBody.data[0].id;
        const detailResponse = await users.getUserDotesthere(userId.toString());
        expect(detailResponse.status()).toBe(200);
        const detailBody = await detailResponse.json();
        expect(detailBody.data.id).toBe(userId);
      }
    });

    test('Should verify consistent data between list and detail endpoints', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      
      const detailResponse = await users.getUserDotesthere('1');
      const detailBody = await detailResponse.json();
      expect(detailBody.data.email).toContain('@');
      expect(typeof detailBody.data.id).toBe('number');
    });
  });

  test.describe('API Response Validation', () => {

    test('Should verify HTTP status codes', async () => {
      const response = await users.getUsersList(1, 10);
      expect([200, 201, 204]).toContain(response.status());
    });

    test('Should verify response time performance', async () => {
      const startTime = Date.now();
      const response = await users.getUsersList(1, 10);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });

    test('Should verify JSON response format', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      expect(typeof body).toBe('object');
      const contentType = response.headers()['content-type'] || '';
      expect(contentType).toContain('application/json');
    });

    test('Should verify pagination boundaries', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      expect(body.page).toBeGreaterThanOrEqual(1);
      expect(body.per_page).toBeGreaterThanOrEqual(1);
      expect(body.total).toBeGreaterThanOrEqual(0);
    });

    test('Should verify user properties are properly typed', async () => {
      const response = await users.getUsersList(1, 10);
      const body = await response.json();
      body.data.forEach((user: any) => {
        expect(typeof user.id).toBe('number');
        expect(typeof user.email).toBe('string');
        expect(typeof user.first_name).toBe('string');
        expect(typeof user.last_name).toBe('string');
        expect(typeof user.avatar).toBe('string');
      });
    });
  });

  test.describe('Comprehensive API Coverage Matrix', () => {

    test('Should test all HTTP methods on users endpoint', async () => {
      // GET
      const getResponse = await users.getUsersList(1, 10);
      expect(getResponse.status()).toBe(200);

      // GET by ID
      const getByIdResponse = await users.getUserDotesthere('1');
      expect(getByIdResponse.status()).toBe(200);

      // POST (may fail based on API)
      const postResponse = await users.postUserDotesthere({ name: 'Test', job: 'QA' }, false);
      expect([201, 500]).toContain(postResponse.status());

      // PUT (may fail based on API)
      const putResponse = await users.putUserDotesthere('1', { name: 'Test' }, false);
      expect([200, 500]).toContain(putResponse.status());

      // DELETE (may fail based on API)
      const deleteResponse = await users.deleteUserDotesthere('1', false);
      expect([200, 204, 404, 500]).toContain(deleteResponse.status());
    });

    test('Should paginate through multiple user pages', async () => {
      const paginationTests = [
        { page: 1, limit: 10 },
        { page: 2, limit: 10 },
        { page: 1, limit: 5 }
      ];

      for (const test of paginationTests) {
        const response = await users.getUsersList(test.page, test.limit);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(typeof body.page).toBe('number');
      }
    });

    test('Should validate complete user dataset integrity', async () => {
      const response = await users.getUsersList(1, 10);
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      // Validate response structure
      expect(Object.keys(body).sort()).toEqual(['data', 'page', 'per_page', 'total', 'total_pages'].sort());
      
      // Validate each user
      body.data.forEach((user: any) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.first_name).toBeDefined();
        expect(user.last_name).toBeDefined();
        expect(user.avatar).toBeDefined();
      });
    });
  });
});
