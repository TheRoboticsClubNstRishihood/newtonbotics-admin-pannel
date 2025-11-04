import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(
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

    console.log('Backend URL:', `${backendUrl}/api/events/${id}`);
    console.log('Event ID:', id);

    const response = await fetch(`${backendUrl}/api/events/${id}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('=== GET EVENT RESPONSE DEBUG ===');
    console.log('Backend response status:', response.status);
    console.log('Full backend response data:', JSON.stringify(data, null, 2));
    if (data.data && data.data.item) {
      console.log('Event from backend (GET):', {
        _id: data.data.item._id,
        title: data.data.item.title,
        startDate: data.data.item.startDate,
        endDate: data.data.item.endDate,
        startTime: data.data.item.startTime,
        endTime: data.data.item.endTime,
        hasStartTime: !!data.data.item.startTime,
        hasEndTime: !!data.data.item.endTime,
        allKeys: Object.keys(data.data.item)
      });
    } else {
      console.warn('Unexpected response structure:', data);
    }
    console.log('=== END GET EVENT RESPONSE DEBUG ===');

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch event' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    console.log('Backend URL:', `${backendUrl}/api/events/${id}`);
    console.log('Event ID:', id);
    console.log('Request body being sent to backend:', JSON.stringify(body, null, 2));
    console.log('Time fields in request:', {
      startTime: body.startTime,
      endTime: body.endTime,
      hasStartTime: !!body.startTime,
      hasEndTime: !!body.endTime
    });

    const response = await fetch(`${backendUrl}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', JSON.stringify(data, null, 2));
    if (data.data && data.data.item) {
      console.log('Updated event from backend:', {
        startTime: data.data.item.startTime,
        endTime: data.data.item.endTime,
        startDate: data.data.item.startDate,
        endDate: data.data.item.endDate
      });
    }

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update event' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    console.log('Backend URL:', `${backendUrl}/api/events/${id}`);
    console.log('Event ID:', id);

    const response = await fetch(`${backendUrl}/api/events/${id}`, {
      method: 'DELETE',
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
        { success: false, message: data.message || 'Failed to delete event' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
