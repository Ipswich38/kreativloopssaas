import { calcomConfig, calcomEndpoints } from './config';
import type {
  CreateManagedUserRequest,
  CreateManagedUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  CalcomEventType,
  CalcomBooking,
} from './types';

export class CalcomClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = calcomConfig.platformBaseUrl;
    this.clientId = calcomConfig.clientId;
    this.clientSecret = calcomConfig.clientSecret;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (!headers.has('Authorization')) {
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64');
      headers.set('Authorization', `Basic ${basicAuth}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cal.com API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createManagedUser(
    userData: CreateManagedUserRequest
  ): Promise<CreateManagedUserResponse> {
    return this.makeRequest<CreateManagedUserResponse>(
      calcomEndpoints.createManagedUser,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    return this.makeRequest<RefreshTokenResponse>(
      calcomEndpoints.refreshToken,
      {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      }
    );
  }

  async getUserEventTypes(accessToken: string): Promise<CalcomEventType[]> {
    return this.makeRequest<CalcomEventType[]>(
      calcomEndpoints.eventTypes,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  async getUserBookings(accessToken: string): Promise<CalcomBooking[]> {
    return this.makeRequest<CalcomBooking[]>(
      calcomEndpoints.bookings,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  async revokeToken(accessToken: string): Promise<void> {
    await this.makeRequest(
      calcomEndpoints.revokeToken,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: accessToken }),
      }
    );
  }
}