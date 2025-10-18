import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Newsletter Campaigns API - GET request received');
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
    if (searchParams.get('template')) queryParams.set('template', searchParams.get('template')!);
    if (searchParams.get('authorId')) queryParams.set('authorId', searchParams.get('authorId')!);
    if (searchParams.get('limit')) queryParams.set('limit', searchParams.get('limit')!);
    if (searchParams.get('skip')) queryParams.set('skip', searchParams.get('skip')!);
    if (searchParams.get('sortBy')) queryParams.set('sortBy', searchParams.get('sortBy')!);
    if (searchParams.get('sortOrder')) queryParams.set('sortOrder', searchParams.get('sortOrder')!);

    const url = `${backendUrl}/api/newsletter/admin/campaigns${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
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
          message: `Backend API not available: ${data.message || data.error?.message || 'Newsletter campaigns API not implemented on backend server'}`,
          error: 'BACKEND_API_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching newsletter campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Newsletter Campaigns API - POST request received');
    console.log('🔗 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app');
    
    const token = request.headers.get('authorization');
    console.log('🔑 Token present:', !!token);
    console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      console.log('❌ No authorization token provided');
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 Creating newsletter campaign:', `${backendUrl}/api/newsletter/admin/campaigns`);
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    const requiredFields = ['title', 'subject', 'content', 'targetAudience', 'template'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'VALIDATION_ERROR',
          missingFields 
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${backendUrl}/api/newsletter/admin/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response ok:', response.ok);
    
    const data = await response.json();
    console.log('📦 Backend response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Successfully created campaign');
      return NextResponse.json(data);
    } else {
      console.log('❌ Backend error:', data.message || data.error?.message);
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend API not available: ${data.message || data.error?.message || 'Newsletter campaigns API not implemented on backend server'}`,
          error: 'BACKEND_API_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error creating newsletter campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
