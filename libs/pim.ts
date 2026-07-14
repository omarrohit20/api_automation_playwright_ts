// pim.ts - PIM (Personnel Information Management) API wrapper for OrangeHRM
import { APIRequestContext, request, APIResponse } from '@playwright/test';
import { sendGetRequest, sendPostRequest, sendPutRequest, sendRequest } from './utils/requests';

export class PimEmployees {
  private baseUrl: string = '';
  private context?: APIRequestContext;
  private contextReady?: Promise<void>;
  private cookies: string;

  public employeeListResponse: any;
  public createEmployeeResponse: any;
  public personalDetailsResponse: any;
  public jobTitlesResponse: any;

  constructor(cookies: string = '', context?: APIRequestContext, baseUrl?: string) {
    const hostConfig = require('../config/hosts.json');
    const env = process.env.ENV || 'dev';

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (hostConfig[env] && hostConfig[env].orangehrm) {
      this.baseUrl = hostConfig[env].orangehrm;
    }

    this.cookies = cookies;

    if (context) {
      this.context = context;
    } else {
      this.contextReady = this.initContext();
    }

    this.initVariables();
  }

  async initContext(): Promise<void> {
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'content-type': 'application/json'
    };
    if (this.cookies) {
      headers['Cookie'] = this.cookies;
    }
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: headers
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

  private cookieHeaders(includeXsrf: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'content-type': 'application/json'
    };
    if (this.cookies) {
      headers['Cookie'] = this.cookies;
      if (includeXsrf) {
        // OrangeHRM uses XSRF-TOKEN cookie for mutation requests;
        // the value must be passed as X-XSRF-TOKEN header (URL-decoded)
        const xsrfMatch = this.cookies.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (xsrfMatch) {
          headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfMatch[1]);
        }
      }
    }
    return headers;
  }

  async listEmployees(params?: Record<string, string | number>, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    const queryString = params
      ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
      : '';
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/pim/employees${queryString}`, this.cookieHeaders(), failOnStatusCode);
  }

  async getEmployee(empNumber: number, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/pim/employees/${empNumber}`, this.cookieHeaders(), failOnStatusCode);
  }

  async getEmployeePersonalDetails(empNumber: number, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/pim/employees/${empNumber}/personal-details`, this.cookieHeaders(), failOnStatusCode);
  }

  async createEmployee(body: { firstName: string; lastName: string; middleName?: string; employeeId?: string }, failOnStatusCode: boolean = false): Promise<APIResponse> {
    await this.ensureContext();
    return sendPostRequest(this.context!, `${this.baseUrl}/api/v2/pim/employees`, body, this.cookieHeaders(true), failOnStatusCode);
  }

  async updatePersonalDetails(empNumber: number, body: any, failOnStatusCode: boolean = false): Promise<APIResponse> {
    await this.ensureContext();
    return sendPutRequest(this.context!, `${this.baseUrl}/api/v2/pim/employees/${empNumber}/personal-details`, body, this.cookieHeaders(true), failOnStatusCode);
  }

  async deleteEmployees(ids: number[], failOnStatusCode: boolean = false): Promise<APIResponse> {
    await this.ensureContext();
    return sendRequest(this.context!, 'DELETE', `${this.baseUrl}/api/v2/pim/employees`, { data: { ids }, failOnStatusCode }, this.cookieHeaders(true), failOnStatusCode);
  }

  async getJobTitles(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/admin/job-titles?limit=0`, this.cookieHeaders(), failOnStatusCode);
  }

  async getEmploymentStatuses(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/admin/employment-statuses?limit=0`, this.cookieHeaders(), failOnStatusCode);
  }

  async getSubUnits(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.baseUrl}/api/v2/admin/subunits`, this.cookieHeaders(), failOnStatusCode);
  }

  private initVariables(): void {
    this.employeeListResponse = {
      data: [
        {
          empNumber: 'should_not_be_null',
          firstName: 'skip',
          lastName: 'skip',
          employeeId: 'skip',
          terminationId: 'skip'
        }
      ],
      meta: {
        total: 'should_not_be_null'
      }
    };

    this.createEmployeeResponse = {
      data: {
        empNumber: 'should_not_be_null',
        firstName: 'skip',
        lastName: 'skip',
        middleName: 'skip',
        employeeId: 'skip',
        terminationId: 'skip'
      },
      meta: [],
      rels: []
    };

    this.personalDetailsResponse = {
      data: {
        empNumber: 'should_not_be_null',
        firstName: 'skip',
        lastName: 'skip',
        middleName: 'skip',
        employeeId: 'skip',
        gender: 'skip',
        maritalStatus: 'skip',
        birthday: 'skip',
        terminationId: 'skip',
        nationality: 'skip'
      },
      meta: [],
      rels: []
    };

    this.jobTitlesResponse = {
      data: [
        {
          id: 'should_not_be_null',
          name: 'skip'
        }
      ],
      meta: {
        total: 'should_not_be_null'
      }
    };
  }
}
