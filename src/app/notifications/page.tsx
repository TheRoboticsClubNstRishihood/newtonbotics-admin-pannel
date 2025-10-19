'use client';

import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from '../../components/notifications/NotificationList';
import { NotificationType, NotificationPriority } from '../../types/notifications';
import { 
  BellIcon, 
  FunnelIcon, 
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const [filters, setFilters] = useState({
    read: undefined as boolean | undefined,
    priority: undefined as NotificationPriority | undefined,
    type: undefined as NotificationType | undefined,
  });

  const { 
    notifications, 
    stats, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    refetch,
    loadMore,
    hasMore 
  } = useNotifications({ 
    limit: 20,
    ...filters
  });

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value as NotificationType | NotificationPriority | boolean | undefined
    }));
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <AdminLayout pageTitle="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your notifications and stay updated with system activities.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BellIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{stats.unread}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.unread}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Read</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.read}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FunnelIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Filtered</dt>
                    <dd className="text-lg font-medium text-gray-900">{notifications.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Read Status
              </label>
              <select
                value={filters.read === undefined ? 'all' : filters.read.toString()}
                onChange={(e) => handleFilterChange('read', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="system_alert">System Alert</option>
                <option value="contact_submission">Contact Submission</option>
                <option value="project_update">Project Update</option>
                <option value="project_approval">Project Approval</option>
                <option value="project_rejection">Project Rejection</option>
                <option value="role_approval">Role Approval</option>
                <option value="inventory_alert">Inventory Alert</option>
                <option value="security_alert">Security Alert</option>
                <option value="user_activity">User Activity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white shadow rounded-lg">
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
