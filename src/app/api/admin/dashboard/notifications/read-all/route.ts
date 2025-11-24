import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';
import { verifyAdminAccess } from '@/lib/adminAuth';

const backendUrl = getBackendUrl();

// PUT /api/admin/dashboard/notifications/read-all
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    // Verify admin access
    const adminUser = await verifyAdminAccess(token, backendUrl);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔔 Mark all notifications as read - PUT request received');

    const url = `${backendUrl}/api/admin/dashboard/notifications/read-all`;
    console.log('🔗 Marking all notifications as read at:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully marked notifications as read');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}