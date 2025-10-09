'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon,
  AcademicCapIcon,
  NewspaperIcon,
  UserGroupIcon,
  PhotoIcon,
  UsersIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';

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

interface DashboardStats {
  totalUsers: number;
  totalNews: number;
  totalEvents: number;
  totalWorkshops: number;
  newsletterStats?: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    recentSubscriptions: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    user: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalNews: 0,
    totalEvents: 0,
    totalWorkshops: 0,
    recentActivity: []
  });

  // Check authentication on page load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      router.push('/');
      return;
    }

    // If we have user data from login, use it immediately
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        fetchDashboardStats();
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
        setIsAuthenticated(true);
        fetchDashboardStats();
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // If token validation fails but we have user data, still show admin panel
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
          fetchDashboardStats();
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setIsAuthenticated(false);
          router.push('/');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Fetch dashboard statistics
      const [usersResponse, newsResponse, newsletterResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005'}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005'}/api/news`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/newsletter/admin/statistics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      const usersData = await usersResponse.json();
      const newsData = await newsResponse.json();
      const newsletterData = await newsletterResponse.json();

      // Mock stats for now - replace with actual API calls
      setStats({
        totalUsers: usersData.success ? usersData.data?.users?.length || 0 : 0,
        totalNews: newsData.success ? newsData.data?.items?.length || 0 : 0,
        totalEvents: 5, // Mock data
        totalWorkshops: 3, // Mock data
        newsletterStats: newsletterData.success ? {
          totalSubscriptions: newsletterData.data.overview.totalSubscriptions,
          activeSubscriptions: newsletterData.data.overview.activeSubscriptions,
          recentSubscriptions: newsletterData.data.overview.recentSubscriptions
        } : undefined,
        recentActivity: [
          {
            id: '1',
            type: 'news',
            title: 'New workshop announced',
            timestamp: new Date().toISOString(),
            user: 'Admin User'
          },
          {
            id: '2',
            type: 'user',
            title: 'New user registered',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'System'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set mock data if API fails
      setStats({
        totalUsers: 25,
        totalNews: 12,
        totalEvents: 5,
        totalWorkshops: 3,
        recentActivity: [
          {
            id: '1',
            type: 'news',
            title: 'New workshop announced',
            timestamp: new Date().toISOString(),
            user: 'Admin User'
          }
        ]
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <NewspaperIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">News Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Workshops</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkshops}</p>
              </div>
            </div>
          </div>

          {stats.newsletterStats && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Newsletter Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newsletterStats.totalSubscriptions}</p>
                  <p className="text-xs text-gray-500">{stats.newsletterStats.activeSubscriptions} active</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

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
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
