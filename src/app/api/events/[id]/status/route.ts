import { NextRequest, NextResponse } from 'next/server';

const backendUrl = 'http://localhost:3005';

export async function PATCH(
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
    const url = `${backendUrl}/api/events/${id}/status`;

    const response = await fetch(url, {
      method: 'PATCH',
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
        { success: false, message: data.message || 'Failed to update status' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating event status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


