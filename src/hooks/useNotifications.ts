import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { 
  UseNotificationsReturn, 
  UseNotificationSettingsReturn,
  NotificationApiParams,
  NotificationSettings,
  Notification,
  NotificationStats
} from '../types/notifications';

/**
 * Hook for managing notifications
 */
export function useNotifications(params: NotificationApiParams = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0, byType: [], byPriority: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const skip = reset ? 0 : currentSkip;
      const response = await notificationService.getNotifications({
        ...params,
        skip,
        limit: params.limit || 20,
      });

      if (response.success) {
        const { notifications: newNotifications, stats: newStats, pagination } = response.data;
        
        if (reset) {
          setNotifications(newNotifications);
          setCurrentSkip(newNotifications.length);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
          setCurrentSkip(prev => prev + newNotifications.length);
        }
        
        setStats(newStats);
        setHasMore(pagination.hasMore);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [params.limit, params.skip, params.type, params.priority, params.read, currentSkip]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id 
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setStats(prev => ({ 
        ...prev, 
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
        );
        
        setStats(prev => ({ 
          ...prev, 
          unread: 0,
          read: prev.total
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  const refetch = useCallback(() => {
    setCurrentSkip(0);
    return fetchNotifications(true);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      return fetchNotifications(false);
    }
    return Promise.resolve();
  }, [loading, hasMore, fetchNotifications]);

  useEffect(() => {
    // Only fetch if limit is greater than 0
    if ((params.limit || 20) > 0) {
      fetchNotifications(true);
    }
  }, [fetchNotifications, params.limit]);

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
    loadMore,
    hasMore,
  };
}

/**
 * Hook for managing notification settings
 */
export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getSettings();
      
      if (response.success) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      setError(null);
      
      const response = await notificationService.updateSettings(newSettings);
      
      if (response.success) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
      throw err;
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch,
  };
}

/**
 * Hook for getting notification count (for bell icon)
 */
export function useNotificationCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 1 });
      
      if (response.success) {
        setCount(response.data.stats.unread);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, loading, refetch: fetchCount };
}
