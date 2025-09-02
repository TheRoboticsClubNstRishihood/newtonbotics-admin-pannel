import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Authentication required. Please log in.' },
          timestamp: new Date().toISOString(),
          path: `/api/role-approvals/${params.email}`,
          method: 'GET'
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/role-approvals/${encodeURIComponent(params.email)}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in role-approvals GET by email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Internal server error' },
        timestamp: new Date().toISOString(),
        path: `/api/role-approvals/${params.email}`,
        method: 'GET'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Authentication required. Please log in.' },
          timestamp: new Date().toISOString(),
          path: `/api/role-approvals/${params.email}`,
          method: 'DELETE'
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/role-approvals/${encodeURIComponent(params.email)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in role-approvals DELETE:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Internal server error' },
        timestamp: new Date().toISOString(),
        path: `/api/role-approvals/${params.email}`,
        method: 'DELETE'
      },
      { status: 500 }
    );
  }
}
