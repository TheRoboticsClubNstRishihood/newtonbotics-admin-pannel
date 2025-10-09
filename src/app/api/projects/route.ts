import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${backendUrl}/api/projects${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching projects from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error details:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: `${backendUrl}/api/projects`
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || data.error || 'Failed to create project',
          details: data,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Creating project with data:', body);
    console.log('Backend URL:', `${backendUrl}/api/projects`);
    console.log('Authorization token:', token ? 'Present' : 'Missing');

    const response = await fetch(`${backendUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Backend response data:', data);

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error details:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: `${backendUrl}/api/projects`
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || data.error || 'Failed to create project',
          details: data,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
