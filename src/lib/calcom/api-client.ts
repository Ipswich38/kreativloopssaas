import { calcomConfig } from './config';

export class CalcomAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = calcomConfig.apiKey || '';
    this.baseUrl = calcomConfig.apiBaseUrl || 'https://api.cal.com';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
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

  // Get user's event types
  async getEventTypes(): Promise<any[]> {
    return this.makeRequest<any[]>('/api/v2/event-types');
  }

  // Get user's bookings
  async getBookings(filters?: {
    status?: string;
    eventTypeId?: number;
    from?: string;
    to?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.eventTypeId) params.append('eventTypeId', filters.eventTypeId.toString());
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<any[]>(`/api/v2/bookings${query}`);
  }

  // Create a booking
  async createBooking(bookingData: {
    eventTypeId: number;
    start: string;
    attendee: {
      name: string;
      email: string;
      timeZone?: string;
    };
    meetingUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return this.makeRequest<any>('/api/v2/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Get a specific booking
  async getBooking(uid: string): Promise<any> {
    return this.makeRequest<any>(`/api/v2/bookings/${uid}`);
  }

  // Cancel a booking
  async cancelBooking(uid: string, reason?: string): Promise<any> {
    return this.makeRequest<any>(`/api/v2/bookings/${uid}/cancel`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  }

  // Reschedule a booking
  async rescheduleBooking(uid: string, newTime: string): Promise<any> {
    return this.makeRequest<any>(`/api/v2/bookings/${uid}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ start: newTime }),
    });
  }

  // Get user profile information
  async getProfile(): Promise<any> {
    return this.makeRequest<any>('/api/v2/me');
  }

  // Get availability for a specific date range
  async getAvailability(params: {
    eventTypeId?: number;
    dateFrom: string;
    dateTo: string;
    timeZone?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.eventTypeId) searchParams.append('eventTypeId', params.eventTypeId.toString());
    searchParams.append('dateFrom', params.dateFrom);
    searchParams.append('dateTo', params.dateTo);
    if (params.timeZone) searchParams.append('timeZone', params.timeZone);

    return this.makeRequest<any>(`/api/v2/slots/available?${searchParams.toString()}`);
  }
}

export const calcomApi = new CalcomAPIClient();