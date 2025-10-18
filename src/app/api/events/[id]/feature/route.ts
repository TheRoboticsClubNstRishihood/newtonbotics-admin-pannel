import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json({ success: false, message: 'Invalid event ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    const url = `${backendUrl}/api/events/${id}/feature`;

    const response = await fetch(url, {
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
    } else if (response.status === 404) {
      return NextResponse.json(
        { success: false, message: data.message || 'Event not found' },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update feature' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating event feature:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


