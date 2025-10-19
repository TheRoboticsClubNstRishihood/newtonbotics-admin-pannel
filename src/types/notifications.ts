// Notification Types
export interface NotificationDelivery {
  email: {
    sent: boolean;
    sentAt: string | null;
    error: string | null;
  };
  push: {
    sent: boolean;
    sentAt: string | null;
    error: string | null;
  };
  sms: {
    sent: boolean;
    sentAt: string | null;
    error: string | null;
  };
  inApp: {
    delivered: boolean;
    deliveredAt: string | null;
  };
}

export interface NotificationRelatedEntity {
  type: string;
  id: string;
  title: string;
}

export interface NotificationAction {
  type: string;
  url: string;
  label: string;
}

export interface NotificationMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  relatedEntity?: NotificationRelatedEntity;
  action?: NotificationAction;
  delivery: NotificationDelivery;
  read: boolean;
  readAt: string | null;
  archived: boolean;
  archivedAt: string | null;
  expiresAt: string | null;
  metadata?: NotificationMetadata;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

export type NotificationType = 
  | 'project_update'
  | 'project_approval'
  | 'project_rejection'
  | 'workshop_update'
  | 'event_update'
  | 'news_update'
  | 'system_alert'
  | 'role_approval'
  | 'inventory_alert'
  | 'contact_submission'
  | 'security_alert'
  | 'backup_alert'
  | 'performance_alert'
  | 'user_activity'
  | 'system_health';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationCategory = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Array<{ type: NotificationType; count: number }>;
  byPriority: Array<{ priority: NotificationPriority; count: number }>;
}

export interface NotificationPagination {
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  stats: NotificationStats;
  pagination: NotificationPagination;
}

export interface NotificationApiResponse {
  success: boolean;
  data: NotificationResponse;
}

export interface NotificationSettings {
  _id?: string;
  userId: string;
  email: {
    enabled: boolean;
    projectUpdates: boolean;
    projectApprovals: boolean;
    projectRejections: boolean;
    workshopUpdates: boolean;
    eventUpdates: boolean;
    newsUpdates: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
    roleApprovals: boolean;
    inventoryAlerts: boolean;
    contactSubmissions: boolean;
  };
  push: {
    enabled: boolean;
    projectUpdates: boolean;
    projectApprovals: boolean;
    projectRejections: boolean;
    workshopUpdates: boolean;
    eventUpdates: boolean;
    newsUpdates: boolean;
    systemAlerts: boolean;
    roleApprovals: boolean;
    inventoryAlerts: boolean;
    contactSubmissions: boolean;
  };
  sms: {
    enabled: boolean;
    projectApprovals: boolean;
    projectRejections: boolean;
    systemAlerts: boolean;
    emergencyAlerts: boolean;
  };
  inApp: {
    enabled: boolean;
    projectUpdates: boolean;
    projectApprovals: boolean;
    projectRejections: boolean;
    workshopUpdates: boolean;
    eventUpdates: boolean;
    newsUpdates: boolean;
    systemAlerts: boolean;
    roleApprovals: boolean;
    inventoryAlerts: boolean;
    contactSubmissions: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  adminSettings: {
    criticalAlerts: boolean;
    systemHealth: boolean;
    userActivity: boolean;
    securityAlerts: boolean;
    backupAlerts: boolean;
    performanceAlerts: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationApiParams {
  limit?: number;
  skip?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
}

export interface NotificationApiError {
  success: false;
  error: {
    message: string;
    details?: {
      statusCode: number;
      isOperational: boolean;
    };
  };
  timestamp: string;
  path: string;
  method: string;
}

// Component Props
export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onActionClick?: (action: NotificationAction) => void;
}

export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  error?: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: Partial<NotificationSettings>) => void;
  loading?: boolean;
  error?: string | null;
}

// Hook return types
export interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseNotificationSettingsReturn {
  settings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refetch: () => Promise<void>;
}
