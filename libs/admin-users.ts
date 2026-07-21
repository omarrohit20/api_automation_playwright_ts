// admin-users.ts - Admin Users API wrapper for OrangeHRM
import { APIRequestContext, request, APIResponse } from '@playwright/test';
import { sendGetRequest } from './utils/requests';

export class AdminUsers {
  private baseUrl: string = '';
  private context?: APIRequestContext;
  private contextReady?: Promise<void>;
  private cookies: string;

  public adminUsersListResponse: any;
  public adminUsersListTemplate: any;

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
   * GET /api/v2/admin/users
   * Supported params: username, userRoleId, status, empNumber, limit, offset, sortField, sortOrder
   */
  async listUsers(
    params?: {
      username?: string;
      userRoleId?: number;
      status?: number;
      empNumber?: number;
      limit?: number;
      offset?: number;
      sortField?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
    failOnStatusCode: boolean = true
  ): Promise<APIResponse> {
    await this.ensureContext();
    const queryParts: string[] = [];
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
    }
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    return sendGetRequest(
      this.context!,
      `${this.baseUrl}/api/v2/admin/users${queryString}`,
      this.cookieHeaders(),
      failOnStatusCode
    );
  }

  /**
   * GET /api/v2/admin/users — called with NO auth cookies.
   * Uses a fresh unauthenticated request context to exercise the 401 path.
   */
  async listUsersUnauthenticated(failOnStatusCode: boolean = false): Promise<APIResponse> {
    const unauthContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });
    return sendGetRequest(
      unauthContext,
      `${this.baseUrl}/api/v2/admin/users`,
      undefined,
      failOnStatusCode
    );
  }

  private initVariables(): void {
    this.adminUsersListResponse = {
      data: 'skip',
      meta: {
        total: 'should_not_be_null'
      },
      rels: []
    };

    this.adminUsersListTemplate = {
      data: [],
      meta: { total: 0 },
      rels: []
    };
  }
}
