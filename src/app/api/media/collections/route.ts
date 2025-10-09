import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const response = await fetch(`${backendUrl}/api/media/collections`, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to fetch collections' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    const body = await request.json();
    const response = await fetch(`${backendUrl}/api/media/collections`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to create collection' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


