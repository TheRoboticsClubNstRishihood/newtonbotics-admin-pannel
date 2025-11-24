import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';
import { verifyAdminAccess } from '@/lib/adminAuth';

const backendUrl = getBackendUrl();

// GET /api/admin/dashboard/settings
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

    console.log('🔔 Notification Settings API - GET request received');

    const url = `${backendUrl}/api/admin/dashboard/settings`;
    console.log('🔗 Fetching notification settings from:', url);

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
    console.log('✅ Successfully fetched notification settings');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/dashboard/settings
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

    console.log('🔔 Update Notification Settings API - PUT request received');

    const body = await request.json();
    console.log('📝 Settings to update:', JSON.stringify(body, null, 2));

    const url = `${backendUrl}/api/admin/dashboard/settings`;
    console.log('🔗 Updating notification settings at:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully updated notification settings');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}