import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNotificationCount, useNotifications } from '../../hooks/useNotifications';
import { NotificationBell } from './NotificationBell';
import { NotificationList } from './NotificationList';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { count, refetch: refetchCount } = useNotificationCount();
  
  // Memoize the params to prevent unnecessary re-renders
  const notificationParams = useMemo(() => ({ limit: 10 }), []);
  
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    loadMore, 
    hasMore,
    refetch: refetchNotifications
  } = useNotifications(notificationParams);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh count when dropdown is opened
  const handleToggle = () => {
    if (!isOpen) {
      refetchCount();
      refetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    // Refresh count after marking as read
    refetchCount();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Refresh count after marking all as read
    refetchCount();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBell
        unreadCount={count}
        onClick={handleToggle}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
      )}
    </div>
  );
}
