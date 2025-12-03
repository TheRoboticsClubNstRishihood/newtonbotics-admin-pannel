import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${backendUrl}/api/users${queryString ? `?${queryString}` : ''}`;

    console.log('Backend URL:', url);
    console.log('Backend URL from env:', process.env.NEXT_PUBLIC_BACKEND_URL || 'not set (using default)');

    let response;
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      response = await fetch(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      // Handle network errors
      console.error('Fetch error:', fetchError);

      const errorDetails =
        fetchError && typeof fetchError === 'object'
          ? (fetchError as { name?: string; message?: string; code?: string })
          : {};

      console.error('Error name:', errorDetails.name);
      console.error('Error message:', errorDetails.message);
      console.error('Error code:', errorDetails.code);
      
      let errorMessage = 'Unable to connect to backend server';
      if (errorDetails.name === 'AbortError') {
        errorMessage = 'Backend server request timed out (10 seconds)';
      } else if (errorDetails.code === 'ECONNREFUSED' || errorDetails.message?.includes('ECONNREFUSED')) {
        errorMessage = `Backend server is not running or not accessible at ${backendUrl}`;
      } else if (errorDetails.message?.includes('fetch failed')) {
        errorMessage = `Failed to connect to backend at ${backendUrl}. Please check if the server is running.`;
      } else if (errorDetails.message) {
        errorMessage = `Network error: ${errorDetails.message}`;
      }
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          details: `Please check if the backend server is running at ${backendUrl}`,
          backendUrl: backendUrl
        },
        { status: 502 }
      );
    }

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    // Clone the response to read it as text if JSON parsing fails
    const responseClone = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, get the text response for debugging
        const textResponse = await responseClone.text();
        console.error('Failed to parse JSON response:', textResponse.substring(0, 500));
        return NextResponse.json(
          {
            success: false,
            message: 'Backend returned invalid response format',
            details: textResponse.substring(0, 200) // First 200 chars for debugging
          },
          { status: 502 }
        );
      }
    } else {
      // Backend returned non-JSON response (likely HTML error page)
      const textResponse = await response.text();
      console.error('Backend returned non-JSON response:', textResponse.substring(0, 500));
      return NextResponse.json(
        {
          success: false,
          message: 'Backend server error',
          details: response.status === 404 
            ? 'Backend endpoint not found. Please check the backend URL configuration.'
            : `Backend returned ${response.status} status with non-JSON response`
        },
        { status: 502 }
      );
    }

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || data.error || 'Failed to fetch users' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching users:', error);
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
    console.log('Creating user with data:', body);

    const response = await fetch(`${backendUrl}/api/users`, {
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
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create user' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
