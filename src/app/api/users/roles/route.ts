import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    console.log('Fetching roles from backend:', `${backendUrl}/api/users/roles`);

    // Try roles endpoint first
    const rolesRes = await fetch(`${backendUrl}/api/users/roles`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    try {
      const rolesData = await rolesRes.json();
      if (rolesRes.ok && Array.isArray(rolesData?.data?.roles)) {
        return NextResponse.json(rolesData);
      }
    } catch {}

    // Fallback: derive roles from users list if endpoint not available
    console.warn('Roles endpoint unavailable. Falling back to deriving from /api/users');
    const usersRes = await fetch(`${backendUrl}/api/users?limit=1000&skip=0`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      const users: Array<{ role?: string }> = usersData?.data?.users || usersData?.users || [];
      const unique = Array.from(
        new Set(
          users
            .map(u => (u?.role || '').toString().trim())
            .filter(Boolean)
        )
      );
      return NextResponse.json({ success: true, data: { roles: unique } });
    }

    // Final fallback roles list
    const defaults = ['student', 'team_member', 'mentor', 'admin'];
    return NextResponse.json({ success: true, data: { roles: defaults } });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Network error while fetching roles',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
