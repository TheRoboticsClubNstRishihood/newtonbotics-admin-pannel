import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Fetching user statistics from backend:', `${backendUrl}/api/users/statistics`);

    const response = await fetch(`${backendUrl}/api/users/statistics`, {
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
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch user statistics from backend',
        error: data 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Network error while fetching user statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
