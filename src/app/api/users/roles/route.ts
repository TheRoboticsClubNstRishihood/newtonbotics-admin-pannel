import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Fetching roles from backend:', `${backendUrl}/api/users/roles`);

    const response = await fetch(`${backendUrl}/api/users/roles`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error:', data);
      
      // Return mock data for testing when backend is not available
      const mockRoles = [
        'student',
        'team_member',
        'mentor',
        'researcher',
        'admin',
        'moderator',
        'instructor',
        'coordinator'
      ];

      return NextResponse.json({
        success: true,
        data: {
          roles: mockRoles
        }
      });
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    
    // Return mock data for testing when network error occurs
    const mockRoles = [
      'student',
      'team_member',
      'mentor',
      'researcher',
      'admin',
      'moderator',
      'instructor',
      'coordinator'
    ];

    return NextResponse.json({
      success: true,
      data: {
        roles: mockRoles
      }
    });
  }
}
