import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Authentication required. Please log in.' },
          timestamp: new Date().toISOString(),
          path: '/api/role-approvals',
          method: 'GET'
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/role-approvals`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in role-approvals GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Internal server error' },
        timestamp: new Date().toISOString(),
        path: '/api/role-approvals',
        method: 'GET'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Authentication required. Please log in.' },
          timestamp: new Date().toISOString(),
          path: '/api/role-approvals',
          method: 'POST'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/role-approvals`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in role-approvals POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Internal server error' },
        timestamp: new Date().toISOString(),
        path: '/api/role-approvals',
        method: 'POST'
      },
      { status: 500 }
    );
  }
}
