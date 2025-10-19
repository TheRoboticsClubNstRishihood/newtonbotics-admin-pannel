// Dashboard API Types
export interface DashboardDateRange {
  start: string;
  end: string;
}

export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalWorkshops: number;
  upcomingEvents: number;
  totalNews: number;
  totalEquipment: number;
  pendingRequests: number;
  contactSubmissions: number;
  newsletterSubscribers: number;
  unreadNotifications: number;
}

export interface DashboardRecentActivity {
  newUsers: number;
  newProjects: number;
  newRequests: number;
  newWorkshops: number;
  newEvents: number;
  newNews: number;
  newContacts: number;
}

export interface StatusCount {
  _id: string;
  count: number;
}

export interface DashboardStatusBreakdown {
  projects: StatusCount[];
  requests: StatusCount[];
  workshops: StatusCount[];
  events: StatusCount[];
  equipment: StatusCount[];
}

export interface ChartDataPoint {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  count: number;
}

export interface EquipmentUtilizationData {
  _id: string;
  count: number;
  available: number;
}

export interface DashboardCharts {
  userGrowth: ChartDataPoint[];
  projectActivity: ChartDataPoint[];
  requestTrends: ChartDataPoint[];
  equipmentUtilization: EquipmentUtilizationData[];
  notificationTrends: ChartDataPoint[];
}

export interface DashboardData {
  period: string;
  dateRange: DashboardDateRange;
  overview: DashboardOverview;
  recentActivity: DashboardRecentActivity;
  statusBreakdown: DashboardStatusBreakdown;
  charts?: DashboardCharts;
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardApiError {
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

export type DashboardPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface DashboardApiParams {
  period?: DashboardPeriod;
  includeCharts?: boolean;
}

// Chart component props
export interface ChartProps {
  data: ChartDataPoint[] | EquipmentUtilizationData[];
  title: string;
  type: 'line' | 'bar' | 'pie' | 'equipment';
  height?: number;
  className?: string;
}

// Stats card props
export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red' | 'indigo';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Activity feed props
export interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    user: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  title?: string;
  maxItems?: number;
}

