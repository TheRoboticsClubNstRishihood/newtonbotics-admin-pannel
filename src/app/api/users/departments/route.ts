import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Fetching departments from backend:', `${backendUrl}/api/users/departments`);

    // Try direct departments endpoint first
    const depRes = await fetch(`${backendUrl}/api/users/departments`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    try {
      const depData = await depRes.json();
      if (depRes.ok && Array.isArray(depData?.data?.departments)) {
        return NextResponse.json(depData);
      }
    } catch {}

    // Fallback: derive departments from users list if endpoint not available
    console.warn('Departments endpoint unavailable. Falling back to deriving from /api/users');
    const usersRes = await fetch(`${backendUrl}/api/users?limit=1000&skip=0`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      const users: Array<{ department?: string }> = usersData?.data?.users || usersData?.users || [];
      const unique = Array.from(
        new Set(
          users
            .map(u => (u?.department || '').toString().trim())
            .filter(Boolean)
        )
      );
      return NextResponse.json({ success: true, data: { departments: unique } });
    }

    // Final fallback: return a sane default list
    const defaults = ['Robotics', 'Electronics', 'Mechanical', 'Software', 'AI/ML', 'Operations', 'Media'];
    return NextResponse.json({ success: true, data: { departments: defaults } });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Network error while fetching departments',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
