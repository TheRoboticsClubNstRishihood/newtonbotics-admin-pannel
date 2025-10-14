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
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('skip', skip);
    
    if (categoryId) queryParams.append('categoryId', categoryId);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    // Make request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    console.log('Backend URL:', backendUrl);
    const response = await fetch(`${backendUrl}/api/inventory/equipment?${queryParams}`, {
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
          message: errorData.message || 'Failed to fetch equipment',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Make request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    console.log('Backend URL:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/inventory/equipment`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.log('Backend response text:', responseText);
      
      let errorData: { message?: string; error?: { message?: string; details?: unknown }; details?: unknown } = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {
        console.log('Could not parse backend error as JSON');
      }
      
      console.log('Backend error data:', errorData);
      console.log('Request body sent to backend:', JSON.stringify(body, null, 2));
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || errorData.error?.message || 'Failed to create equipment',
          status: response.status,
          details: errorData.error?.details || errorData.details || errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
