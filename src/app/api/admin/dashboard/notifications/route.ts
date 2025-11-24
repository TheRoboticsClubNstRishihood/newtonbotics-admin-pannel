import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';
import { verifyAdminAccess } from '@/lib/adminAuth';

const backendUrl = getBackendUrl();

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const skip = searchParams.get('skip') || '0';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const read = searchParams.get('read');

    console.log('🔔 Notifications API - GET request received');
    console.log('📊 Query params - limit:', limit, 'skip:', skip, 'type:', type, 'priority:', priority, 'read:', read);

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit,
      skip
    });
    
    if (type) queryParams.append('type', type);
    if (priority) queryParams.append('priority', priority);
    if (read) queryParams.append('read', read);

    const url = `${backendUrl}/api/admin/dashboard/notifications?${queryParams.toString()}`;
    console.log('🔗 Fetching notifications from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched', data.data?.notifications?.length || 0, 'notifications');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}