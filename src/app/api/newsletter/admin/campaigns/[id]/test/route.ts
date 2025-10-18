import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Sending test newsletter campaign:', `${backendUrl}/api/newsletter/admin/campaigns/${id}/test`);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${backendUrl}/api/newsletter/admin/campaigns/${id}/test`, {
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
        { success: false, message: data.message || data.error?.message || 'Failed to send test campaign' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error sending test newsletter campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
