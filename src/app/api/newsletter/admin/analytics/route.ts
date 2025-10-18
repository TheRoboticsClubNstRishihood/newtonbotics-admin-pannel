import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Newsletter Analytics API - GET request received');
    console.log('🔗 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app');
    
    const token = request.headers.get('authorization');
    console.log('🔑 Token present:', !!token);
    console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      console.log('❌ No authorization token provided');
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Add query parameters if they exist
    if (searchParams.get('startDate')) queryParams.set('startDate', searchParams.get('startDate')!);
    if (searchParams.get('endDate')) queryParams.set('endDate', searchParams.get('endDate')!);

    const url = `${backendUrl}/api/newsletter/admin/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('🌐 Making request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response ok:', response.ok);
    
    const data = await response.json();
    console.log('📦 Backend response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend API not available: ${data.message || data.error?.message || 'Newsletter analytics API not implemented on backend server'}`,
          error: 'BACKEND_API_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching newsletter analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
