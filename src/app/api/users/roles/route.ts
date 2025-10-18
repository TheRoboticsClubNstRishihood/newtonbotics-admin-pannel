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
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch roles from backend',
        error: data 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Network error while fetching roles',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
