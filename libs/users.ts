// users.ts - Users API wrapper for Playwright
import { APIRequestContext, request } from '@playwright/test';
import { convertToJson } from './utils/common';
import { sendPostRequest, sendGetRequest, sendPutRequest, sendPatchRequest, sendDeleteRequest } from './utils/requests';

export class Users {
  private baseUrl: string = '';
  private context?: APIRequestContext;
  private contextReady?: Promise<void>;

  public userPostPayloadRequest: any;
  public userPostResponse: any;
  public userGetResponse: any;
  public usersListResponse: any;
  public dotesthereUsersListResponse: any;
  public dotesthereUserResponse: any;
  public dotesthereCreateUserResponse: any;
  public dotesthereUpdateUserResponse: any;
  
  constructor(context?: APIRequestContext, baseUrl?: string) {
    const hostConfig = require('../config/hosts.json');
    const env = process.env.ENV || 'dev';

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (hostConfig[env] && hostConfig[env].dotesthere) {
      this.baseUrl = hostConfig[env].dotesthere;
    }

    if (context) {
      this.context = context;
    } else {
      this.contextReady = this.initContext();
    }

    this.initVariables();
  }

  async initContext(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'Accept': 'application/json'
      }
    });
  }

  private async ensureContext(): Promise<void> {
    if (this.context) {
      return;
    }
    if (!this.contextReady) {
      throw new Error('API request context was not initialized.');
    }
    await this.contextReady;
    if (!this.context) {
      throw new Error('Failed to initialize API request context.');
    }
  }

  dotesthereUsersUrl(): string {
    return `${this.baseUrl}/api/users`;
  }

  async getUsersList(page: number = 1, limit: number = 10): Promise<any> {
    const response = await sendGetRequest(this.context!, `${this.dotesthereUsersUrl()}?page=${page}&limit=${limit}`);
    return response;
  }

  async postUserDotesthere(user: any, failOnStatusCode: boolean = true): Promise<any> {
    const response = await sendPostRequest(this.context!, this.dotesthereUsersUrl(), user, undefined, failOnStatusCode);
    return response;
  }

  async getUserDotesthere(id: string, failOnStatusCode: boolean = true): Promise<any> {
    const response = await sendGetRequest(this.context!, `${this.dotesthereUsersUrl()}/${id}`, undefined, failOnStatusCode);
    return response;
  }

  async putUserDotesthere(id: string, user: any, failOnStatusCode: boolean = true): Promise<any> {
    const response = await sendPutRequest(this.context!, `${this.dotesthereUsersUrl()}/${id}`, user, failOnStatusCode);
    return response;
  }

  async deleteUserDotesthere(id: string, failOnStatusCode: boolean = true): Promise<any> {
    const response = await sendDeleteRequest(this.context!, `${this.dotesthereUsersUrl()}/${id}`, failOnStatusCode);
    return response;
  }

  private initVariables(): void {
    this.userPostPayloadRequest = convertToJson('{\n      "name": "",\n      "job": ""\n    }');

    this.userPostResponse = convertToJson('{\n      "name": "",\n      "job": "",\n      "id": "should_not_be_null",\n      "createdAt": "skip"\n    }');

    this.userGetResponse = convertToJson('{\n      "data": {\n        "id": "should_not_be_null",\n        "email": "janet.weaver@reqres.in",\n        "first_name": "Janet",\n        "last_name": "Weaver",\n        "avatar": "https://reqres.in/img/faces/2-image.jpg"\n      },\n      "support": {\n        "url": "https://reqres.in/#support-heading",\n        "text": "To keep ReqRes free, contributions towards server costs are appreciated!"\n      }\n    }');

    this.usersListResponse = convertToJson(`{\n      "page": 1,\n      "per_page": 10,\n      "total": "should_not_be_null",\n      "total_pages": "should_not_be_null",\n      "data": [\n        {\n          "id": "should_not_be_null",\n          "email": "match_regex:/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/",\n          "first_name": "only_chars",\n          "last_name": "only_chars",\n          "avatar": "match_regex:/^https?:\\\\/\\\\/.*\\\\.(jpg|png|jpeg|gif)$/"\n        }\n      ]\n    }`);

    this.dotesthereUsersListResponse = {
      page: 1,
      per_page: 10,
      total: 'should_not_be_null',
      total_pages: 'should_not_be_null',
      data: [
        {
          id: 'should_not_be_null',
          email: 'match_regex:/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/',
          first_name: 'only_chars',
          last_name: 'only_chars',
          avatar: 'match_regex:/^https?:\\/\\/.*\\.(jpg|png|jpeg|gif)$/'
        }
      ]
    };

    this.dotesthereUserResponse = {
      data: {
        id: 'should_not_be_null',
        email: 'match_regex:/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/',
        first_name: 'only_chars',
        last_name: 'only_chars',
        avatar: 'match_regex:/^https?:\\/\\/.*\\.(jpg|png|jpeg|gif)$/'
      }
    };

    this.dotesthereCreateUserResponse = {
      name: '',
      job: '',
      id: 'should_not_be_null',
      createdAt: 'skip'
    };

    this.dotesthereUpdateUserResponse = {
      name: '',
      job: '',
      updatedAt: 'skip'
    };
  }
}
