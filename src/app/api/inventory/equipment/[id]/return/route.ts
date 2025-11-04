import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validate equipment ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, message: 'Invalid equipment ID' },
        { status: 400 }
      );
    }

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
    console.log('Backend URL:', backendUrl);
    console.log('Equipment ID:', id);
    
    const response = await fetch(`${backendUrl}/api/inventory/equipment/${id}/return`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to return equipment',
          status: response.status,
          details: errorData.details || errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error returning equipment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


