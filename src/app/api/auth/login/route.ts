import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the mock backend
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
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
              const isLeader = projects.some((project: any) => {
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