import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header missing or invalid'
        },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const { valid, payload } = verifyToken(token);
    
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    // Check if user exists and is active
    if (payload.email !== ADMIN_USER.email || !ADMIN_USER.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found or inactive'
        },
        { status: 401 }
      );
    }

    // Return user profile
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          firstName: ADMIN_USER.firstName,
          lastName: ADMIN_USER.lastName,
          role: ADMIN_USER.role,
          isActive: ADMIN_USER.isActive,
          emailVerified: ADMIN_USER.emailVerified,
          permissions: ADMIN_USER.permissions,
          lastLogin: ADMIN_USER.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
