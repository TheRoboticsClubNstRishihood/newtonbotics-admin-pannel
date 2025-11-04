import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    // Note: Research areas are public, but we still forward auth if provided
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${backendUrl}/api/research-areas${queryString ? `?${queryString}` : ''}`;

    console.log('Backend URL:', url);

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch research areas' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching research areas:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received at:', request.url);
    const token = request.headers.get('authorization');
    console.log('Token received:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Backend URL:', backendUrl);
    console.log('Request body sent to backend:', JSON.stringify(body, null, 2));
    console.log('studentIds being forwarded to backend:', body.studentIds);

    const url = `${backendUrl}/api/research-areas`;
    console.log('Calling backend URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    type ApiError = { message?: string; details?: unknown; [key: string]: unknown } | undefined;
    type ApiResponse<T> = T & { success?: boolean; message?: string; error?: ApiError };
    let data: ApiResponse<Record<string, unknown>>;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse response as JSON:', responseText);
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    if (response.ok) {
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', JSON.stringify(data, null, 2));
      const responseData = data.data as { item?: { studentIds?: unknown } } | undefined;
      console.log('studentIds in backend response:', responseData?.item?.studentIds);
      return NextResponse.json(data);
    } else {
      console.error('Backend error response:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || `Failed to create research area (${response.status})`,
          error: data.error?.message,
          details: data.error?.details
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error creating research area:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

