import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Newsletter Subscriptions API - GET request received');
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
    if (searchParams.get('q')) queryParams.set('q', searchParams.get('q')!);
    if (searchParams.get('status')) queryParams.set('status', searchParams.get('status')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('skip')) queryParams.set('skip', searchParams.get('skip')!);
    if (searchParams.get('sortBy')) queryParams.set('sortBy', searchParams.get('sortBy')!);
    if (searchParams.get('sortOrder')) queryParams.set('sortOrder', searchParams.get('sortOrder')!);

    const url = `${backendUrl}/api/newsletter/admin/subscriptions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
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
      console.log('✅ Successfully fetched subscriptions');
      return NextResponse.json(data);
    } else {
      console.log('❌ Backend error:', data.message || data.error?.message);
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend API not available: ${data.message || data.error?.message || 'Newsletter admin API not implemented on backend server'}`,
          error: 'BACKEND_API_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('💥 Error fetching newsletter subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
