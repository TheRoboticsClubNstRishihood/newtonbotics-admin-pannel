import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function POST(request: NextRequest) {
  console.log('Admin API Route POST called');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    console.log('API Route - Received body:', body);

    // Make request to your backend API
    console.log('API Route - Backend URL:', backendUrl);
    console.log('API Route - Environment variables:', {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });
    
    const response = await fetch(`${backendUrl}/api/news/admin`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('API Route - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('API Route - Error data:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.error?.message || errorData.message || 'Failed to create news article',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
