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
    const url = `${backendUrl}/api/events${queryString ? `?${queryString}` : ''}`;

    console.log('Backend URL:', url);

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
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch events' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received at:', request.url);
    const token = request.headers.get('authorization');
    console.log('Token received:', token ? 'Token exists' : 'No token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const rawBody = await request.json();
    // Sanitize and normalize optional fields before forwarding
    const body: any = { ...rawBody };
    if (!body.requiresRegistration) {
      delete body.registrationDeadline;
      delete body.registrationFormLink;
    } else {
      if (typeof body.registrationDeadline === 'string' && body.registrationDeadline.trim() === '') {
        delete body.registrationDeadline;
      } else if (body.registrationDeadline) {
        try {
          body.registrationDeadline = new Date(body.registrationDeadline).toISOString();
        } catch {}
      }
      if (typeof body.registrationFormLink === 'string' && body.registrationFormLink.trim() === '') {
        delete body.registrationFormLink;
      }
    }
    // Clean featureOptions when showInNav is false or missing
    if (!body.featureOptions || body.featureOptions.showInNav !== true) {
      if (body.featureOptions) {
        delete body.featureOptions.navLabel;
        delete body.featureOptions.navOrder;
      }
    }
    console.log('Backend URL:', backendUrl);
    console.log('Request body sent to backend:', JSON.stringify(body, null, 2));

    const url = `${backendUrl}/api/events`;
    console.log('Calling backend URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse response as JSON:', responseText);
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error response:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || `Failed to create event (${response.status})`,
          error: data.error?.message,
          details: data.error?.details
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
