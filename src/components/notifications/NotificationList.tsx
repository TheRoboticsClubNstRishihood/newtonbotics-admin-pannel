import React from 'react';
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { NotificationListProps } from '../../types/notifications';
import { NotificationItem } from './NotificationItem';

export function NotificationList({ 
  notifications, 
  loading, 
  error, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onLoadMore,
  hasMore 
}: NotificationListProps) {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-2">Failed to load notifications</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CheckIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No notifications</p>
          <p className="text-xs text-gray-400">You&apos;re all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header with Mark All as Read */}
      {onMarkAllAsRead && (
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification Items */}
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-2" />
                Load more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
