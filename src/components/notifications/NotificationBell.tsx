import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationBellProps } from '../../types/notifications';

export function NotificationBell({ unreadCount, onClick, className = '' }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 ${className}`}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <BellIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
}
