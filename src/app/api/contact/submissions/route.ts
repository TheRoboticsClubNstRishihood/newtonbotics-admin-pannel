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
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority);
    if (department) queryParams.append('department', department);
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    // Make request to your backend API
    const response = await fetch(`${backendUrl}/api/contact/submissions?${queryParams}`, {
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
          message: errorData.message || 'Failed to fetch contact submissions',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
