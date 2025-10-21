import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  Cog6ToothIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { NotificationItemProps, NotificationPriority, NotificationCategory } from '../../types/notifications';

const priorityColors: Record<NotificationPriority, string> = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-blue-600 bg-blue-100',
  high: 'text-orange-600 bg-orange-100',
  critical: 'text-red-600 bg-red-100',
};

const categoryIcons: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  system: Cog6ToothIcon,
};

const categoryColors: Record<NotificationCategory, string> = {
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-orange-600',
  error: 'text-red-600',
  system: 'text-gray-600',
};

export function NotificationItem({ notification, onMarkAsRead, onActionClick }: NotificationItemProps) {
  const CategoryIcon = categoryIcons[notification.category];
  
  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  const handleActionClick = () => {
    if (notification.action && onActionClick) {
      onActionClick(notification.action);
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.read ? 'bg-gray-50' : 'bg-white'
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start space-x-3">
        {/* Category Icon */}
        <div className={`flex-shrink-0 ${categoryColors[notification.category]}`}>
          <CategoryIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              {/* Priority Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[notification.priority]}`}>
                {notification.priority}
              </span>
              
              {/* Time */}
              <span className="text-xs text-gray-500 flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                {notification.timeAgo}
              </span>
            </div>
          </div>

          <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          {/* Related Entity */}
          {notification.relatedEntity && (
            <div className="mt-2 text-xs text-gray-500">
              Related to: {notification.relatedEntity.title}
            </div>
          )}

          {/* Action Button */}
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick();
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <EyeIcon className="w-3 h-3 mr-1" />
                {notification.action.label}
              </button>
            </div>
          )}

          {/* Delivery Status */}
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            {notification.delivery.email.sent && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Email sent
              </span>
            )}
            {notification.delivery.push.sent && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                Push sent
              </span>
            )}
            {notification.delivery.inApp.delivered && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                In-app delivered
              </span>
            )}
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}



