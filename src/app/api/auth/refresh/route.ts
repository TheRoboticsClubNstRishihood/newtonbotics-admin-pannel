import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock admin user data (in production, this would come from a database)
const ADMIN_USER = {
  id: '64f8a1b2c3d4e5f6a7b8c9d0',
  email: 'admin@newtonbotics.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  emailVerified: true,
  permissions: ['*'],
  lastLogin: '2023-09-05T10:30:00.000Z'
};

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

    // Verify refresh token
    const { valid, payload } = AuthService.verifyRefreshToken(refreshToken);
    
    if (!valid || !payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired refresh token'
        },
        { status: 401 }
      );
    }

    // Check if user exists and is active
    if (payload.userId !== ADMIN_USER.id || !ADMIN_USER.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found or inactive'
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = AuthService.generateAccessToken({
      userId: ADMIN_USER.id,
      email: ADMIN_USER.email,
      role: ADMIN_USER.role,
      permissions: ADMIN_USER.permissions
    });

    // Generate new refresh token
    const newRefreshToken = AuthService.generateRefreshToken(ADMIN_USER.id);

    // Return new tokens
    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: '24h'
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
