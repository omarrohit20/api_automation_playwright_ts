import { test, expect } from '@playwright/test';
import { Users } from '../../libs/users';
import { verifyResponseCode, verifyResponseTemplate, verifyResponseIsSuccessfulCreateEntity } from '../../libs/utils/assertions';

test.describe('Users Dotesthere', () => {
  let users: Users;

  test.beforeAll(async () => {
    users = new Users();
  });

  test.describe('Dotesthere Users API', () => {
    // Define the dataset array
const usersList = [
  { name: 'Playwright', job: 'Fast and reliable' },
  { name: 'TypeScript', job: 'Typed JavaScript' },
  { name: 'Automation', job: 'Testing' }
];
// Iterate through each dataset
for (const user of usersList) {
    test('Do test here crud operations', async () => {
      //post user
      const requestPayload = { name: user.name, job: user.job };
      const postResponse = await users.postUserDotesthere(requestPayload, false);
      const expectedResponse = { ...users.dotesthereCreateUserResponse, name: requestPayload.name, job: requestPayload.job };
      verifyResponseTemplate(postResponse, expectedResponse, 201);

      //get user by id
      // if (postStatus === 201) {
      // const postResponseBody = await postResponse.json();
      const userId = '1';
      const getResponse = await users.getUserDotesthere(userId, false);
      const expectResponse = { ...users.dotesthereUserResponse, data: { ...users.dotesthereUserResponse.data, id: parseInt(userId) } };
      verifyResponseTemplate(getResponse, expectResponse, 200);

      // // get user List
      const listResponse = await users.getUsersList(1, 10);
      verifyResponseTemplate(listResponse, users.dotesthereUsersListResponse, 200);

      // //put user
      const updatedUser = { name: 'Updated User', job: 'Updated Job' };
      const putResponse = await users.putUserDotesthere(userId, updatedUser, false);
      verifyResponseTemplate(putResponse, users.userGetResponse, 200);

      

    });

  });

});
