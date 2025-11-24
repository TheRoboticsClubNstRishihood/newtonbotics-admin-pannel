import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNotificationCount, useNotifications } from '../../hooks/useNotifications';
import { NotificationBell } from './NotificationBell';
import { NotificationList } from './NotificationList';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { count, refetch: refetchCount } = useNotificationCount();
  
  // Check if user is admin
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);
  
  // Memoize the params to prevent unnecessary re-renders
  // Only fetch notifications if user is admin (limit: 0 means don't fetch)
  const notificationParams = useMemo(() => ({ limit: isAdmin ? 10 : 0 }), [isAdmin]);
  
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

  // Refresh count when dropdown is opened (only for admins)
  const handleToggle = () => {
    if (!isOpen && isAdmin) {
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

  // Don't show notification bell for non-admin users
  if (!isAdmin) {
    return null;
  }

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
