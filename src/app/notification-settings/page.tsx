'use client';

import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useNotificationSettings } from '../../hooks/useNotifications';
import { NotificationSettingsForm } from '../../components/notifications/NotificationSettings';
import { NotificationSettings } from '../../types/notifications';
import { 
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function NotificationSettingsPage() {
  const { 
    settings, 
    loading, 
    error, 
    updateSettings, 
    refetch 
  } = useNotificationSettings();

  const handleUpdate = async (newSettings: Partial<NotificationSettings>) => {
    await updateSettings(newSettings);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Notification Settings">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Notification Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your notification preferences and delivery methods.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Settings Form */}
        <NotificationSettingsForm
          settings={settings!}
          onUpdate={handleUpdate}
          loading={loading}
          error={error}
        />
      </div>
    </AdminLayout>
  );
}
