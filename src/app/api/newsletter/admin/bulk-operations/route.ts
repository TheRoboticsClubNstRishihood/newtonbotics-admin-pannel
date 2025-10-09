import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Bulk newsletter operation:', `${backendUrl}/api/newsletter/admin/bulk-operations`);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${backendUrl}/api/newsletter/admin/bulk-operations`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || data.error?.message || 'Failed to perform bulk operation' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error performing bulk newsletter operation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
