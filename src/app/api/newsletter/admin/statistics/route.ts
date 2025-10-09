import { NextRequest, NextResponse } from 'next/server';

const backendUrl = 'http://localhost:3005';

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
      return NextResponse.json(
        { success: false, message: data.message || data.error?.message || 'Failed to fetch newsletter statistics' },
        { status: response.status }
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
