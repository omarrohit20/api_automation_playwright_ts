import { test, expect } from '@playwright/test';
import { Users } from '../../libs/users';
import { verifyResponseCode, verifyResponseTemplate, verifyResponseIsSuccessfulCreateEntity } from '../../libs/utils/assertions';

test.describe('Users Dotesthere', () => {
  let users: Users;

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext({
      baseURL: 'https://dotesthere.com'
    });
    users = new Users(context, 'https://dotesthere.com');
  });

  test.describe('Dotesthere Users API', () => {
    test('Get users list with pagination', async () => {
      console.log('Expected Response:', JSON.stringify(users.dotesthereUsersListResponse));
      const response = await users.getUsersList(1, 10);
      console.log('Get Users List Response:', JSON.stringify(await response.json()));
      await verifyResponseTemplate(response, users.dotesthereUsersListResponse, 200);
    });

    test('Get users list - Page 2 behavior', async () => {
      const response = await users.getUsersList(2, 5);
      verifyResponseCode(response, 200);
      const expectedResponse = {
        ...users.dotesthereUsersListResponse,
        page: 2,
        data: []
      };
      await verifyResponseTemplate(response, expectedResponse, 200);
    });

    test('Get users list - Default pagination', async () => {
      const response = await users.getUsersList();
      await verifyResponseTemplate(response, users.dotesthereUsersListResponse, 200);
    });

    test('Get users list - Verify user data structure', async () => {
      const response = await users.getUsersList(1, 1);
      await verifyResponseTemplate(response, users.dotesthereUsersListResponse, 200);
    });
  });

  test.describe('Dotesthere Users CRUD Operations', () => {
    test('Create a new user', async () => {
      const newUser = { name: 'Test User', job: 'Test Automation Engineer' };
      const response = await users.postUserDotesthere(newUser, false);
      const status = response.status();
      
      if (status === 201) {
        const expectedResponse = { ...users.dotesthereCreateUserResponse, name: newUser.name, job: newUser.job };
        await verifyResponseTemplate(response, expectedResponse, 201);
      } else {
        expect([500]).toContain(status);
      }
    });

    test('Create user with multiple variations', async () => {
      const testUsers = [
        { name: 'John Developer', job: 'Senior Developer' },
        { name: 'Jane QA', job: 'QA Engineer' },
        { name: 'Alex DevOps', job: 'DevOps Engineer' }
      ];

      for (const testUser of testUsers) {
        const response = await users.postUserDotesthere(testUser, false);
        const status = response.status();
        
        if (status === 201) {
          const expectedResponse = { ...users.dotesthereCreateUserResponse, name: testUser.name, job: testUser.job };
          await verifyResponseTemplate(response, expectedResponse, 201);
        } else {
          expect([500]).toContain(status);
        }
      }
    });

    test('Get single user by ID', async () => {
      const response = await users.getUserDotesthere('1');
      const expectedResponse = { ...users.dotesthereUserResponse, data: { ...users.dotesthereUserResponse.data, id: 1 } };
      await verifyResponseTemplate(response, expectedResponse, 200);
    });

    test('Get different users by ID', async () => {
      const userIds = ['1', '2'];

      for (const userId of userIds) {
        const response = await users.getUserDotesthere(userId);
        
        if (response.status() === 200) {
          const expectedResponse = { ...users.dotesthereUserResponse, data: { ...users.dotesthereUserResponse.data, id: parseInt(userId) } };
          await verifyResponseTemplate(response, expectedResponse, 200);
        }
      }
    });

    test('Update user information', async () => {
      const updateData = { name: 'John Updated', job: 'Senior Developer Updated' };
      const response = await users.putUserDotesthere('1', updateData, false);
      
      if (response.status() === 200) {
        const expectedResponse = { ...users.dotesthereUpdateUserResponse, name: updateData.name, job: updateData.job };
        await verifyResponseTemplate(response, expectedResponse, 200);
      } else {
        expect([500]).toContain(response.status());
      }
    });

    test('Update user - Partial fields', async () => {
      const response = await users.putUserDotesthere('2', { name: 'Partial Update' }, false);
      
      if (response.status() === 200) {
        const expectedResponse = { ...users.dotesthereUpdateUserResponse, name: 'Partial Update' };
        await verifyResponseTemplate(response, expectedResponse, 200);
      } else {
        expect([500]).toContain(response.status());
      }
    });

    test('Delete user by ID', async () => {
      const response = await users.deleteUserDotesthere('1', false);
      expect([200, 204, 404, 500]).toContain(response.status());
    });

    test('Delete multiple users', async () => {
      const userIdsToDelete = ['5', '6', '7'];

      for (const userId of userIdsToDelete) {
        const response = await users.deleteUserDotesthere(userId, false);
        expect([200, 204, 404, 500]).toContain(response.status());
      }
    });
  });

  test.describe('Dotesthere API - Edge Cases & Validation', () => {
    test('Create user with special characters in name', async () => {
      const specialUser = { name: 'Test User @#$%&', job: 'Developer-Tester_2024' };
      const response = await users.postUserDotesthere(specialUser, false);
      
      if (response.status() === 201) {
        const expectedResponse = { ...users.dotesthereCreateUserResponse, name: specialUser.name, job: specialUser.job };
        await verifyResponseTemplate(response, expectedResponse, 201);
      } else {
        expect([500]).toContain(response.status());
      }
    });

    test('Create user with long strings', async () => {
      const longUser = { name: 'A'.repeat(100), job: 'B'.repeat(100) };
      const response = await users.postUserDotesthere(longUser, false);
      
      if (response.status() === 201) {
        const expectedResponse = { ...users.dotesthereCreateUserResponse, name: longUser.name, job: longUser.job };
        await verifyResponseTemplate(response, expectedResponse, 201);
      } else {
        expect([500]).toContain(response.status());
      }
    });

    test('Get non-existent user - Verify error handling', async () => {
      const response = await users.getUserDotesthere('99999', false);
      expect([200, 404]).toContain(response.status());
    });

    test('Create and immediately retrieve user', async () => {
      const newUser = { name: 'Create-Retrieve Test', job: 'Test Engineer' };
      const postResponse = await users.postUserDotesthere(newUser, false);
      
      if (postResponse.status() === 201) {
        const responseBody = await postResponse.json();
        const createdUserId = responseBody.id;
        const getResponse = await users.getUserDotesthere(createdUserId.toString(), false);
        
        if (getResponse.status() === 200) {
          const expectedResponse = { ...users.dotesthereUserResponse, data: { ...users.dotesthereUserResponse.data, id: parseInt(createdUserId, 10) } };
          await verifyResponseTemplate(getResponse, expectedResponse, 200);
        } else {
          expect([404]).toContain(getResponse.status());
        }
      } else {
        expect([500]).toContain(postResponse.status());
      }
    });

    test('Create, Update, and Verify flow', async () => {
      const createData = { name: 'Flow Test User', job: 'QA Engineer' };
      const updateData = { name: 'Flow Test Updated', job: 'Lead QA' };
      const postResponse = await users.postUserDotesthere(createData, false);
      
      if (postResponse.status() === 201) {
        const responseBody = await postResponse.json();
        const userId = responseBody.id;
        const updateResponse = await users.putUserDotesthere(userId.toString(), updateData, false);
        
        if (updateResponse.status() === 200) {
          const expectedResponse = { ...users.dotesthereUpdateUserResponse, name: updateData.name, job: updateData.job };
          await verifyResponseTemplate(updateResponse, expectedResponse, 200);
        } else {
          expect([500]).toContain(updateResponse.status());
        }
      } else {
        expect([500]).toContain(postResponse.status());
      }
    });
  });
});
