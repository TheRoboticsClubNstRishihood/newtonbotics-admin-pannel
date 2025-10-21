import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('News Application API Route POST called');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);

  try {
    // Get the request body
    const body = await request.json();
    console.log('API Route - Received application body:', body);

    // Get the authorization header (optional for public applications)
    const authHeader = request.headers.get('authorization');

    // Make request to your backend API
    const resolvedParams = await params;
    console.log('API Route - Backend URL:', backendUrl);
    console.log('API Route - News ID:', resolvedParams.id);
    console.log('API Route - Environment variables:', {
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authorization header if provided
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${backendUrl}/api/news/${resolvedParams.id}/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log('API Route - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('API Route - Error data:', errorData);
      return NextResponse.json(
        {
          success: false,
          message: errorData.error?.message || errorData.message || 'Failed to submit application',
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Route - Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
