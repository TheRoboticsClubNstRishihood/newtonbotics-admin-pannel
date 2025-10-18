import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Backend URL:', backendUrl);
    console.log('Full URL:', `${backendUrl}/api/newsletter/admin/statistics`);
    console.log('Environment BACKEND_URL:', process.env.BACKEND_URL);

    const response = await fetch(`${backendUrl}/api/newsletter/admin/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.log('❌ Backend statistics API not available');
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend API not available: ${data.message || data.error?.message || 'Newsletter statistics API not implemented on backend server'}`,
          error: 'BACKEND_API_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching newsletter statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
