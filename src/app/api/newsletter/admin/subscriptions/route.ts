import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Add query parameters if they exist
    if (searchParams.get('q')) queryParams.set('q', searchParams.get('q')!);
    if (searchParams.get('status')) queryParams.set('status', searchParams.get('status')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('skip')) queryParams.set('skip', searchParams.get('skip')!);
    if (searchParams.get('sortBy')) queryParams.set('sortBy', searchParams.get('sortBy')!);
    if (searchParams.get('sortOrder')) queryParams.set('sortOrder', searchParams.get('sortOrder')!);

    const url = `${backendUrl}/api/newsletter/admin/subscriptions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
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
        { success: false, message: data.message || data.error?.message || 'Failed to fetch subscriptions' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
