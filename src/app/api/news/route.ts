import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const skip = searchParams.get('skip') || '0';
    const isPublished = searchParams.get('isPublished');
    const isFeatured = searchParams.get('isFeatured');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('skip', skip);
    
    if (isPublished) queryParams.append('isPublished', isPublished);
    if (isFeatured) queryParams.append('isFeatured', isFeatured);
    if (categoryId) queryParams.append('categoryId', categoryId);
    if (search) queryParams.append('search', search);

    // Make request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/news?${queryParams}`, {
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
          message: errorData.message || 'Failed to fetch news articles',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('API Route POST called');
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
    const backendUrl = 'http://localhost:3005';
    console.log('API Route - Backend URL:', backendUrl);
    console.log('API Route - Environment variables:', {
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });
    
    const response = await fetch(`${backendUrl}/api/news`, {
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
          message: errorData.message || 'Failed to create news article',
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
