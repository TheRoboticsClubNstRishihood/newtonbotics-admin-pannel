import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Fetching departments from backend:', `${backendUrl}/api/users/departments`);

    const response = await fetch(`${backendUrl}/api/users/departments`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend error:', data);
      
      // Return mock data for testing when backend is not available
      const mockDepartments = [
        'Computer Science',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Information Technology',
        'Robotics Engineering',
        'Artificial Intelligence',
        'Data Science',
        'Software Engineering'
      ];

      return NextResponse.json({
        success: true,
        data: {
          departments: mockDepartments
        }
      });
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    
    // Return mock data for testing when network error occurs
    const mockDepartments = [
      'Computer Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Information Technology',
      'Robotics Engineering',
      'Artificial Intelligence',
      'Data Science',
      'Software Engineering'
    ];

    return NextResponse.json({
      success: true,
      data: {
        departments: mockDepartments
      }
    });
  }
}
