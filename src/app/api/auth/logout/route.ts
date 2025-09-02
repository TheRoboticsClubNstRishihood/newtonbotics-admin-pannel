import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    // Validate input
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Refresh token is required'
        },
        { status: 400 }
      );
    }

    // Verify refresh token to ensure it's valid before logout
    const { valid, payload } = AuthService.verifyRefreshToken(refreshToken);
    
    if (!valid || !payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid refresh token'
        },
        { status: 401 }
      );
    }

    // In a production environment, you would:
    // 1. Add the refresh token to a blacklist in Redis/database
    // 2. Remove the token from the user's active sessions
    // 3. Log the logout event for audit purposes

    // For now, we'll just return success
    // In production, implement proper token invalidation

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
