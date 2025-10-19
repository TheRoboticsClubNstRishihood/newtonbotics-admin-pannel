import { NextRequest, NextResponse } from 'next/server';

// Mock notification settings data
const mockNotificationSettings = {
  email: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: true,
    equipment: true,
    system: true,
    frequency: 'immediate' as const
  },
  push: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: false,
    equipment: true,
    system: true,
    frequency: 'immediate' as const
  },
  sms: {
    enabled: false,
    projectRequests: false,
    events: true,
    news: false,
    equipment: false,
    system: true,
    frequency: 'daily' as const
  },
  inApp: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: true,
    equipment: true,
    system: true,
    frequency: 'immediate' as const
  },
  frequency: {
    immediate: true,
    daily: false,
    weekly: false,
    monthly: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC'
  },
  admin: {
    receiveAllNotifications: true,
    notificationDigest: 'daily' as const,
    systemAlerts: true,
    userActivityAlerts: true
  }
};

// Helper function to get auth headers
function getAuthHeaders(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }
  return {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
  };
}

// GET /api/admin/dashboard/settings
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Notification Settings API - GET request received');
    
    // Validate auth header
    getAuthHeaders(request);
    
    console.log('✅ Successfully fetched notification settings');
    
    return NextResponse.json({
      success: true,
      data: {
        settings: mockNotificationSettings
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Notification Settings API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          details: { statusCode: 500, isOperational: true }
        },
        timestamp: new Date().toISOString(),
        path: '/api/admin/dashboard/settings',
        method: 'GET'
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/dashboard/settings
export async function PUT(request: NextRequest) {
  try {
    console.log('🔔 Update Notification Settings API - PUT request received');
    
    // Validate auth header
    getAuthHeaders(request);
    
    const body = await request.json();
    console.log('📝 Settings to update:', JSON.stringify(body, null, 2));
    
    // Update the mock settings (in a real app, this would be saved to a database)
    Object.assign(mockNotificationSettings, body);
    
    console.log('✅ Successfully updated notification settings');
    
    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        settings: mockNotificationSettings
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Update Notification Settings API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          details: { statusCode: 500, isOperational: true }
        },
        timestamp: new Date().toISOString(),
        path: '/api/admin/dashboard/settings',
        method: 'PUT'
      },
      { status: 500 }
    );
  }
}