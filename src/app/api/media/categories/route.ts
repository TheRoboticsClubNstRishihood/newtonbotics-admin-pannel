import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    
    console.log('Categories API - Backend URL:', backendUrl);
    console.log('Categories API - Request URL:', `${backendUrl}/api/media/categories${query ? `?${query}` : ''}`);
    console.log('Categories API - Token:', token ? 'present' : 'missing');
    
    const response = await fetch(`${backendUrl}/api/media/categories${query ? `?${query}` : ''}`, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Categories API - Backend response status:', response.status);

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to fetch media categories' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error fetching media categories:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    const body = await request.json();
    
    // Debug logging
    console.log('Media Categories API POST - Backend URL:', backendUrl);
    console.log('Media Categories API POST - Environment variables:', {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      BACKEND_URL: process.env.BACKEND_URL
    });
    
    const response = await fetch(`${backendUrl}/api/media/categories`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to create media category' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error creating media category:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


