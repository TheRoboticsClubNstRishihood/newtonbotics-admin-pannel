'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon,
  AcademicCapIcon,
  NewspaperIcon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardPeriod } from '../../types/dashboard';
import DashboardOverviewComponent from '../../components/dashboard/DashboardOverview';
import Chart from '../../components/dashboard/Chart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import PeriodSelector from '../../components/dashboard/PeriodSelector';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  permissions: string[];
  lastLogin?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('30d');
  
  // Use the new dashboard hook
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch, refresh } = useDashboard({
    period: selectedPeriod,
    includeCharts: true,
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    enableCache: true
  });


  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      setIsLoading(false);
      router.push('/');
      return;
    }

    // If we have user data from login, use it immediately
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // If token validation fails but we have user data, still show admin panel
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check authentication on page load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle period change
  const handlePeriodChange = (period: DashboardPeriod) => {
    setSelectedPeriod(period);
  };

  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mb-4">
                You are logged in as <strong>{user?.firstName} {user?.lastName}</strong> 
                with role <strong>{user?.role}</strong>.
              </p>
              <p className="text-gray-600">
                Email: {user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <PeriodSelector 
                selectedPeriod={selectedPeriod} 
                onPeriodChange={handlePeriodChange}
              />
              <button
                onClick={refresh}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {dashboardError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <p className="mt-1 text-sm text-red-700">{dashboardError}</p>
                <button
                  onClick={refetch}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Overview */}
        {dashboardData && (
          <>
            <DashboardOverviewComponent overview={dashboardData?.overview} />

            {/* Charts Section */}
            {dashboardData?.charts ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Chart
                  data={dashboardData?.charts?.userGrowth || []}
                  title="User Growth"
                  type="line"
                  height={300}
                />
                <Chart
                  data={dashboardData?.charts?.projectActivity || []}
                  title="Project Activity"
                  type="bar"
                  height={300}
                />
                <Chart
                  data={dashboardData?.charts?.equipmentUtilization || []}
                  title="Equipment Utilization"
                  type="equipment"
                  height={300}
                />
                <Chart
                  data={dashboardData?.charts?.requestTrends || []}
                  title="Request Trends"
                  type="line"
                  height={300}
                />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Charts Not Available</h3>
                <p className="text-gray-600 mb-4">
                  Chart data is not available for the selected period. Try refreshing or selecting a different time period.
                </p>
                <button
                  onClick={refresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            )}

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.statusBreakdown && Object.entries(dashboardData.statusBreakdown).map(([key, statuses]) => (
                <div key={key} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                    {key} Status
                  </h3>
                  <div className="space-y-2">
                    {statuses.map((status: { _id: string; count: number }) => (
                      <div key={status._id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{status._id}</span>
                        <span className="text-sm font-medium text-gray-900">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  id: '1',
                  type: 'user',
                  title: `${dashboardData?.recentActivity?.newUsers || 0} new users registered`,
                  timestamp: new Date().toISOString(),
                  user: 'System',
                  icon: UsersIcon
                },
                {
                  id: '2',
                  type: 'project',
                  title: `${dashboardData?.recentActivity?.newProjects || 0} new projects created`,
                  timestamp: new Date().toISOString(),
                  user: 'System',
                  icon: DocumentTextIcon
                },
                {
                  id: '3',
                  type: 'request',
                  title: `${dashboardData?.recentActivity?.newRequests || 0} new requests submitted`,
                  timestamp: new Date().toISOString(),
                  user: 'System',
                  icon: ExclamationTriangleIcon
                },
                {
                  id: '4',
                  type: 'workshop',
                  title: `${dashboardData?.recentActivity?.newWorkshops || 0} new workshops scheduled`,
                  timestamp: new Date().toISOString(),
                  user: 'System',
                  icon: AcademicCapIcon
                },
                {
                  id: '5',
                  type: 'news',
                  title: `${dashboardData?.recentActivity?.newNews || 0} new news articles published`,
                  timestamp: new Date().toISOString(),
                  user: 'System',
                  icon: NewspaperIcon
                }
              ]}
              title="Recent Activity Summary"
              maxItems={5}
            />
          </>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/news/create')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <NewspaperIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create News</span>
              </button>

              <button
                onClick={() => router.push('/users')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UsersIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </button>

              <button
                onClick={() => router.push('/events')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Events</span>
              </button>

              <button
                onClick={() => router.push('/projects')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DocumentTextIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Projects</span>
              </button>

              <button
                onClick={() => router.push('/inventory')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Inventory</span>
              </button>

              <button
                onClick={() => router.push('/newsletter')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Newsletter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
