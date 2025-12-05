export interface CalcomManagedUser {
  id: number;
  email: string;
  username?: string;
  name?: string;
  timezone?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface CreateManagedUserRequest {
  email: string;
  name?: string;
  timezone?: string;
  username?: string;
}

export interface CreateManagedUserResponse {
  user: {
    id: number;
    email: string;
    username: string;
    name: string;
    timezone: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CalcomEventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  description?: string;
  hidden: boolean;
}

export interface CalcomBooking {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CANCELLED' | 'ACCEPTED';
  attendees: CalcomAttendee[];
  eventType: CalcomEventType;
}

export interface CalcomAttendee {
  id: number;
  email: string;
  name: string;
  timezone?: string;
}