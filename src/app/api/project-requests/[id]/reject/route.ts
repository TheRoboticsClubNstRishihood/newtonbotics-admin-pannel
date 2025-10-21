import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const url = `${backendUrl}/api/project-requests/${id}/reject`;

    console.log('Rejecting project request:', url);

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
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to reject project request' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error rejecting project request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}





