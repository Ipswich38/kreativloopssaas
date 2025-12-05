import { NextRequest, NextResponse } from 'next/server';
import { ManagedUserService } from '@/lib/calcom/managed-users';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const managedUserService = new ManagedUserService();
    const refreshedTokens = await managedUserService.refreshUserTokens(refreshToken);

    return NextResponse.json({
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      expiresIn: Math.floor((refreshedTokens.expiresAt.getTime() - Date.now()) / 1000),
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}