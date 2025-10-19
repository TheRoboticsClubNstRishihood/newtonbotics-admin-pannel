import { NextRequest, NextResponse } from 'next/server';

// Mock notification data
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

// GET /api/admin/dashboard/notifications
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Notifications API - GET request received');
    
    // Validate auth header
    getAuthHeaders(request);
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const read = searchParams.get('read');
    
    console.log(`📊 Query params - limit: ${limit}, skip: ${skip}, type: ${type}, priority: ${priority}, read: ${read}`);
    
    // Filter notifications based on query parameters
    let filteredNotifications = [...mockNotifications];
    
    if (type) {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
    }
    
    if (priority) {
      filteredNotifications = filteredNotifications.filter(notif => notif.priority === priority);
    }
    
    if (read !== null && read !== undefined) {
      const isRead = read === 'true';
      filteredNotifications = filteredNotifications.filter(notif => notif.read === isRead);
    }
    
    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    const total = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);
    
    // Calculate stats
    const stats = {
      total: mockNotifications.length,
      unread: mockNotifications.filter(n => !n.read).length,
      byType: {
        project_update: mockNotifications.filter(n => n.type === 'project_update').length,
        event_update: mockNotifications.filter(n => n.type === 'event_update').length,
        news_update: mockNotifications.filter(n => n.type === 'news_update').length,
        inventory_alert: mockNotifications.filter(n => n.type === 'inventory_alert').length,
        system_alert: mockNotifications.filter(n => n.type === 'system_alert').length
      },
      byPriority: {
        high: mockNotifications.filter(n => n.priority === 'high').length,
        medium: mockNotifications.filter(n => n.priority === 'medium').length,
        low: mockNotifications.filter(n => n.priority === 'low').length
      }
    };
    
    const response = {
      success: true,
      data: {
        notifications: paginatedNotifications,
        stats,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      },
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Successfully fetched ${paginatedNotifications.length} notifications`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Notifications API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          details: { statusCode: 500, isOperational: true }
        },
        timestamp: new Date().toISOString(),
        path: '/api/admin/dashboard/notifications',
        method: 'GET'
      },
      { status: 500 }
    );
  }
}