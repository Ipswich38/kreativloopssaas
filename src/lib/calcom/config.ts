export const calcomConfig = {
  clientId: process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID!,
  clientSecret: process.env.CAL_OAUTH_CLIENT_SECRET!,
  apiUrl: process.env.NEXT_PUBLIC_CAL_API_URL!,
  platformBaseUrl: process.env.CAL_PLATFORM_BASE_URL!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cal/callback`,
  scopes: ['read', 'write', 'booking:read', 'booking:write'],
};

export const calcomEndpoints = {
  createManagedUser: '/managed-users',
  refreshToken: '/oauth/token',
  revokeToken: '/oauth/revoke',
  eventTypes: '/event-types',
  bookings: '/bookings',
} as const;