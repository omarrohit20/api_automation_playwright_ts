// leave.ts - Leave API wrapper for OrangeHRM
import { APIRequestContext, request, APIResponse } from '@playwright/test';
import { sendGetRequest } from './utils/requests';

export class Leave {
  private baseUrl: string = '';
  private context?: APIRequestContext;
  private contextReady?: Promise<void>;
  private cookies: string;

  public leaveRequestsResponse: any;
  public leaveTypesResponse: any;
  public leavePeriodsResponse: any;
  public holidaysResponse: any;
  public workweekResponse: any;

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

  private cookieHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'content-type': 'application/json'
    };
    if (this.cookies) {
      headers['Cookie'] = this.cookies;
    }
    return headers;
  }

  /**
   * GET /api/v2/leave/employees/leave-requests
   * Supported params: limit, offset, fromDate, toDate, includeEmployees,
   * statuses[] (array), leaveTypeId, empNumber, subunitId
   */
  async listLeaveRequests(
    params?: {
      limit?: number;
      offset?: number;
      fromDate?: string;
      toDate?: string;
      includeEmployees?: 'onlyCurrent' | 'includeTerminated';
      statuses?: number[];
      leaveTypeId?: number;
      empNumber?: number;
      subunitId?: number;
    },
    failOnStatusCode: boolean = true
  ): Promise<APIResponse> {
    await this.ensureContext();
    let queryParts: string[] = [];
    if (params) {
      const { statuses, ...rest } = params;
      // Scalar params
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
      // Array param: statuses[] must be repeated
      if (statuses && statuses.length > 0) {
        for (const s of statuses) {
          queryParts.push(`statuses%5B%5D=${encodeURIComponent(String(s))}`);
        }
      }
    }
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/leave/employees/leave-requests${queryString}`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  /**
   * GET /api/v2/leave/leave-types?limit=0
   */
  async getLeaveTypes(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/leave/leave-types?limit=0`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  /**
   * GET /api/v2/leave/leave-periods
   */
  async getLeavePeriods(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/leave/leave-periods`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  /**
   * GET /api/v2/leave/holidays?fromDate=X&toDate=Y
   */
  async getHolidays(
    fromDate: string,
    toDate: string,
    failOnStatusCode: boolean = true
  ): Promise<APIResponse> {
    await this.ensureContext();
    const queryString = `?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/leave/holidays${queryString}`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  /**
   * GET /api/v2/leave/workweek?model=indexed
   * Returns day-keyed object e.g. {"1":0,"2":0,"3":0,"4":0,"5":0,"6":8,"0":8}
   */
  async getWorkweek(model: string = 'indexed', failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    const queryString = `?model=${encodeURIComponent(model)}`;
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/leave/workweek${queryString}`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  private initVariables(): void {
    this.leaveRequestsResponse = {
      data: [],
      meta: {
        total: 'should_not_be_null'
      },
      rels: 'skip'
    };

    this.leaveTypesResponse = {
      data: [
        {
          id: 'should_not_be_null',
          name: 'skip',
          deleted: 'skip',
          situational: 'skip'
        }
      ],
      meta: {
        total: 'should_not_be_null'
      },
      rels: 'skip'
    };

    this.leavePeriodsResponse = {
      data: 'skip',
      meta: {
        leavePeriodDefined: 'should_not_be_null',
        currentLeavePeriod: {
          startDate: 'should_not_be_null',
          endDate: 'should_not_be_null'
        }
      },
      rels: 'skip'
    };

    this.holidaysResponse = {
      data: 'skip',
      meta: 'skip',
      rels: 'skip'
    };

    this.workweekResponse = {
      data: 'should_not_be_null',
      meta: 'skip',
      rels: 'skip'
    };
  }
}
