import { NextRequest, NextResponse } from 'next/server';

const backendUrl = 'http://localhost:3005';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json({ success: false, message: 'Invalid event ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const rawBody = await request.json();
    // Sanitize optional fields: omit or normalize empty strings
    const body: any = { ...rawBody };
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
    if (!body.requiresRegistration) {
      delete body.registrationDeadline;
      delete body.registrationFormLink;
    }
    if (!body.featureOptions || body.featureOptions.showInNav !== true) {
      if (body.featureOptions) {
        delete body.featureOptions.navLabel;
        delete body.featureOptions.navOrder;
      }
    }
    const url = `${backendUrl}/api/events/admin/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else if (response.status === 404) {
      return NextResponse.json(
        { success: false, message: data.message || 'Event not found' },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update event' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating admin event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


