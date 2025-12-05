'use client';

import { ReactNode } from 'react';
import { CalProvider } from '@calcom/atoms';
import '@calcom/atoms/globals.min.css';

interface CalcomProviderProps {
  children: ReactNode;
  accessToken?: string;
}

export function CalcomProvider({ children, accessToken }: CalcomProviderProps) {
  if (!process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID || !accessToken) {
    return <>{children}</>;
  }

  return (
    <CalProvider
      accessToken={accessToken}
      clientId={process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID}
      options={{
        apiUrl: process.env.NEXT_PUBLIC_CAL_API_URL || 'https://api.cal.com/api/platform/v1',
        refreshUrl: '/api/cal/refresh',
      }}
    >
      {children}
    </CalProvider>
  );
}