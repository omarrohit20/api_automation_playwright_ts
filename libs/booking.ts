import { APIRequestContext, request, APIResponse } from '@playwright/test';
import { readTestDataJson } from './utils/common';
import { sendPostRequest, sendGetRequest, sendPutRequest, sendDeleteRequest } from './utils/requests';

export class Booking {
  private baseUrl: string = '';
  private context?: APIRequestContext;
  private contextReady?: Promise<void>;
  private authToken?: string;

  public authRequest: any;
  public authResponse: any;
  public createBookingRequest: any;
  public createBookingResponse: any;
  public updateBookingRequest: any;
  public updateBookingResponse: any;
  public partialUpdateRequest: any;
  public partialUpdateResponse: any;
  public getBookingResponse: any;

  constructor(context?: APIRequestContext, baseUrl?: string) {
    const hostConfig = require('../config/hosts.json');
    const env = process.env.ENV || 'dev';

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (hostConfig[env] && hostConfig[env].restful_booker) {
      this.baseUrl = hostConfig[env].restful_booker;
    }

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

    if (this.authToken) {
      headers['Cookie'] = `token=${this.authToken}`;
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

  restfulBookingUrl(): string {
    return `${this.baseUrl}`;
  }

  async authenticate(username: string, password: string, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    const response = await sendPostRequest(
      this.context!,
      `${this.restfulBookingUrl()}/auth`,
      { username, password },
      undefined,
      failOnStatusCode
    );

    if (response.status() === 200) {
      const body = await response.json();
      if (body?.token) {
        this.authToken = body.token;
        await this.initContext();
      }
    }

    return response;
  }

  async getBookingList(failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.restfulBookingUrl()}/booking`, undefined, failOnStatusCode);
  }

  async getBookingById(id: string, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendGetRequest(this.context!, `${this.restfulBookingUrl()}/booking/${id}`, undefined, failOnStatusCode);
  }

  async createBooking(booking: any, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    return sendPostRequest(this.context!, `${this.restfulBookingUrl()}/booking`, booking, undefined, failOnStatusCode);
  }

  async updateBooking(id: string, booking: any, token?: string, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    const headers = {
      'Cookie': `token=${token ?? this.authToken ?? ''}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    return sendPutRequest(this.context!, `${this.restfulBookingUrl()}/booking/${id}`, booking, headers, failOnStatusCode);
  }

  async deleteBooking(id: string, token?: string, failOnStatusCode: boolean = true): Promise<APIResponse> {
    await this.ensureContext();
    const headers = {
      'Cookie': `token=${token ?? this.authToken ?? ''}`,
      'Content-Type': 'application/json'
    };
    return sendDeleteRequest(this.context!, `${this.restfulBookingUrl()}/booking/${id}`, headers, failOnStatusCode);
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  private initVariables(): void {
    this.authRequest = readTestDataJson('booking/auth_request.json');
    this.authResponse = readTestDataJson('booking/auth_response.json');
    this.createBookingRequest = readTestDataJson('booking/create_booking_request.json');
    this.createBookingResponse = readTestDataJson('booking/create_booking_response.json');
    this.updateBookingRequest = readTestDataJson('booking/update_booking_request.json');
    this.updateBookingResponse = readTestDataJson('booking/update_booking_response.json');
    this.partialUpdateRequest = readTestDataJson('booking/partial_update_request.json');
    this.partialUpdateResponse = readTestDataJson('booking/partial_update_response.json');
    this.getBookingResponse = readTestDataJson('booking/get_booking_response.json');
  }
}
