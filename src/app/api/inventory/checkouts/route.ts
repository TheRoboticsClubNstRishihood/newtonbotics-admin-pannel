import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

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
    const equipmentId = searchParams.get('equipmentId');
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('skip', skip);
    
    if (equipmentId) queryParams.append('equipmentId', equipmentId);
    if (userId) queryParams.append('userId', userId);
    if (projectId) queryParams.append('projectId', projectId);
    if (status) queryParams.append('status', status);

    // Make request to your backend API
    console.log('Backend URL:', backendUrl);
    const response = await fetch(`${backendUrl}/api/inventory/checkouts?${queryParams}`, {
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
          message: errorData.message || 'Failed to fetch checkouts',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


