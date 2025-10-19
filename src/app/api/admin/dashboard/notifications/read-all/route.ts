import { NextRequest, NextResponse } from 'next/server';

// Mock notification data (same as in the main notifications route)
const mockNotifications = [
  {
    _id: 'notif_001',
    userId: 'admin_user_001',
    title: 'New Project Request',
    message: 'A new project request has been submitted by John Doe',
    type: 'project_update',
    priority: 'medium',
    category: 'info',
    read: false,
    readAt: null,
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: false,
        sentAt: null,
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'project_request',
      id: 'req_001',
      title: 'AI Chatbot Development'
    },
    action: {
      type: 'review',
      url: '/project-requests/req_001',
      label: 'Review Request'
    },
    metadata: {
      requesterName: 'John Doe',
      requesterEmail: 'john.doe@university.edu',
      projectTitle: 'AI Chatbot Development'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2 hours ago'
  },
  {
    _id: 'notif_002',
    userId: 'admin_user_001',
    title: 'Event Registration Deadline',
    message: 'Registration deadline for Robotics Workshop is approaching',
    type: 'event_update',
    priority: 'high',
    category: 'warning',
    read: false,
    readAt: null,
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: true,
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'event',
      id: 'event_001',
      title: 'Robotics Workshop'
    },
    action: {
      type: 'view',
      url: '/events/event_001',
      label: 'View Event'
    },
    metadata: {
      eventTitle: 'Robotics Workshop',
      deadlineDate: '2024-01-15T23:59:59.000Z',
      currentRegistrations: 15,
      maxCapacity: 30
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeAgo: '4 hours ago'
  },
  {
    _id: 'notif_003',
    userId: 'admin_user_001',
    title: 'News Article Published',
    message: 'Your news article "Team Achievements" has been published',
    type: 'news_update',
    priority: 'low',
    category: 'success',
    read: true,
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: false,
        sentAt: null,
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'news',
      id: 'news_001',
      title: 'Team Achievements'
    },
    action: {
      type: 'view',
      url: '/news/news_001',
      label: 'View Article'
    },
    metadata: {
      articleTitle: 'Team Achievements',
      authorName: 'Admin User',
      publishDate: '2024-01-10T10:00:00.000Z'
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1 day ago'
  },
  {
    _id: 'notif_004',
    userId: 'admin_user_001',
    title: 'Equipment Request Approved',
    message: 'Your equipment request for Arduino Kits has been approved',
    type: 'inventory_alert',
    priority: 'medium',
    category: 'success',
    read: false,
    readAt: null,
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: false,
        sentAt: null,
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'equipment',
      id: 'equip_001',
      title: 'Arduino Kits'
    },
    action: {
      type: 'view',
      url: '/inventory/equip_001',
      label: 'View Equipment'
    },
    metadata: {
      equipmentName: 'Arduino Kits',
      quantity: 10,
      requesterName: 'Jane Smith',
      approvalDate: '2024-01-12T14:30:00.000Z'
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    timeAgo: '6 hours ago'
  },
  {
    _id: 'notif_005',
    userId: 'admin_user_001',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur tonight from 2-4 AM',
    type: 'system_alert',
    priority: 'high',
    category: 'system',
    read: true,
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: true,
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'system',
      id: 'maintenance_001',
      title: 'System Maintenance'
    },
    action: {
      type: 'info',
      url: '/settings',
      label: 'View Settings'
    },
    metadata: {
      maintenanceStart: '2024-01-15T02:00:00.000Z',
      maintenanceEnd: '2024-01-15T04:00:00.000Z',
      affectedServices: ['API', 'Database', 'File Storage']
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '12 hours ago'
  }
];

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

// PUT /api/admin/dashboard/notifications/read-all
export async function PUT(request: NextRequest) {
  try {
    console.log('🔔 Mark all notifications as read - PUT request received');
    
    // Validate auth header
    getAuthHeaders(request);
    
    // Mark all unread notifications as read
    let markedCount = 0;
    mockNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        notification.updatedAt = new Date().toISOString();
        markedCount++;
      }
    });
    
    console.log(`✅ Successfully marked ${markedCount} notifications as read`);
    
    return NextResponse.json({
      success: true,
      message: `Marked ${markedCount} notifications as read`,
      data: {
        markedCount,
        totalNotifications: mockNotifications.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          details: { statusCode: 500, isOperational: true }
        },
        timestamp: new Date().toISOString(),
        path: '/api/admin/dashboard/notifications/read-all',
        method: 'PUT'
      },
      { status: 500 }
    );
  }
}