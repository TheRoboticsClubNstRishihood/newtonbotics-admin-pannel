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
      return NextResponse.json({ success: false, message: 'Invalid research area ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    // Note: Research areas are public, but we still forward auth if provided
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    console.log('Backend URL:', `${backendUrl}/api/research-areas/${id}`);
    console.log('Research Area ID:', id);

    const response = await fetch(`${backendUrl}/api/research-areas/${id}`, {
      headers
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch research area' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching research area:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid research area ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Backend URL:', `${backendUrl}/api/research-areas/${id}`);
    console.log('Research Area ID:', id);
    console.log('Request body being sent to backend:', JSON.stringify(body, null, 2));
    console.log('studentIds in request body:', body.studentIds);
    console.log('studentIds type:', typeof body.studentIds);
    console.log('studentIds is array:', Array.isArray(body.studentIds));
    console.log('studentIds length:', body.studentIds?.length);
    
    // Ensure studentIds is always an array
    if (body.studentIds !== undefined && !Array.isArray(body.studentIds)) {
      console.warn('⚠️ studentIds is not an array, converting...', body.studentIds);
      body.studentIds = [];
    }

    const response = await fetch(`${backendUrl}/api/research-areas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse backend response as JSON:', responseText);
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    if (response.ok) {
      console.log('Backend PUT response status:', response.status);
      console.log('Backend PUT response data:', JSON.stringify(data, null, 2));
      console.log('studentIds in backend PUT response:', data.data?.item?.studentIds);
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update research area' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating research area:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid research area ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Backend URL:', `${backendUrl}/api/research-areas/${id}`);
    console.log('Research Area ID:', id);

    const response = await fetch(`${backendUrl}/api/research-areas/${id}`, {
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
        { success: false, message: data.message || 'Failed to delete research area' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error deleting research area:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

