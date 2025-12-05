export const calcomConfig = {
  // Direct API access (v2)
  apiKey: process.env.CAL_LIVE_API_KEY,
  apiBaseUrl: process.env.CAL_API_BASE_URL || 'https://api.cal.com',
  apiUrl: process.env.NEXT_PUBLIC_CAL_API_URL || 'https://api.cal.com/api/v2',

  // OAuth Platform access (for managed users)
  clientId: process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID,
  clientSecret: process.env.CAL_OAUTH_CLIENT_SECRET,
  platformBaseUrl: process.env.CAL_PLATFORM_BASE_URL || 'https://api.cal.com/api/platform/v1',
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