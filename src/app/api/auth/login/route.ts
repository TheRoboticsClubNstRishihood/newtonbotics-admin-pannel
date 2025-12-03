import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the backend URL being used (for debugging)
    const loginUrl = `${backendUrl}/api/auth/login`;
    console.log('Attempting login to:', loginUrl);
    console.log('Backend URL from env:', process.env.NEXT_PUBLIC_BACKEND_URL || 'not set (using default)');
    
    let response;
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Forward the request to the backend
      response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      // Handle network errors (connection refused, timeout, etc.)
      console.error('Fetch error:', fetchError);
      console.error('Error name:', fetchError?.name);
      console.error('Error message:', fetchError?.message);
      console.error('Error code:', fetchError?.code);
      
      let errorMessage = 'Unable to connect to backend server';
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Backend server request timed out (10 seconds)';
      } else if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED')) {
        errorMessage = `Backend server is not running or not accessible at ${backendUrl}`;
      } else if (fetchError.message?.includes('fetch failed')) {
        errorMessage = `Failed to connect to backend at ${backendUrl}. Please check if the server is running.`;
      } else if (fetchError.message) {
        errorMessage = `Network error: ${fetchError.message}`;
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
    
    // Check if login was successful
    if (data.success && data.data && data.data.user) {
      const userRole = data.data.user.role;
      const userId = data.data.user.id || data.data.user._id;
      const accessToken = data.data.tokens?.accessToken;
      const projectsInvolvement = data.data.user.projectsInvolvement;
      
      // Allow admin users
      if (userRole === 'admin') {
        return NextResponse.json(data, { status: response.status });
      }
      
      // For team_member, check if they are a project leader
      if (userRole === 'team_member' && userId) {
        // First, check if projectsInvolvement shows they are a leader (more efficient)
        if (projectsInvolvement && projectsInvolvement.ledProjectsCount > 0) {
          // User is a project leader, allow login
          return NextResponse.json(data, { status: response.status });
        }
        
        // Fallback: Check via API if projectsInvolvement is not available
        if (accessToken) {
          try {
            // Check if user is a project leader
            const projectsResponse = await fetch(`${backendUrl}/api/projects?teamLeaderId=${userId}&limit=1`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json();
              const projects = projectsData?.data?.projects || projectsData?.data?.items || projectsData?.projects || [];
              
              // Check if user is the team leader of any project
              interface ProjectWithLeader {
                teamLeaderId?: string | { _id?: string; id?: string };
              }
              const isLeader = projects.some((project: ProjectWithLeader) => {
                const leaderId = typeof project.teamLeaderId === 'string' 
                  ? project.teamLeaderId 
                  : (project.teamLeaderId?._id || project.teamLeaderId?.id || '');
                return leaderId === userId;
              });

              if (isLeader) {
                // User is a project leader, allow login
                return NextResponse.json(data, { status: response.status });
              }
            }
          } catch (error) {
            console.error('Error checking project leader status:', error);
          }
        }
      }
      
      // If not admin and not a project leader, deny access
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to visit admin"
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}