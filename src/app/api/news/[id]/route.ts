import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Make request to your backend API
    const resolvedParams = await params;
    const response = await fetch(`${backendUrl}/api/news/${resolvedParams.id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to fetch news article',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news article:', error);
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
  console.log('News Update API Route PUT called');
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

    // Make request to your backend API using the admin endpoint
    const resolvedParams = await params;
    console.log('API Route - Backend URL:', backendUrl);
    console.log('API Route - Article ID:', resolvedParams.id);
    console.log('API Route - Environment variables:', {
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });

    const response = await fetch(`${backendUrl}/api/news/admin/${resolvedParams.id}`, {
      method: 'PUT',
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
          message: errorData.error?.message || errorData.message || 'Failed to update news article',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating news article:', error);
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
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Make request to your backend API
    const resolvedParams = await params;
    const response = await fetch(`${backendUrl}/api/news/${resolvedParams.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to delete news article',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
