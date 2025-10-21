import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardPeriod } from '../types/dashboard';
import DashboardApiService from '../services/dashboardApi';

export interface UseDashboardOptions {
  period?: DashboardPeriod;
  includeCharts?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableCache?: boolean;
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for fetching dashboard data
 */
export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
  const {
    period = '30d',
    includeCharts = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    enableCache = true
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = { period, includeCharts };
      const dashboardData = bypassCache 
        ? await DashboardApiService.refreshDashboardData(params)
        : enableCache 
          ? await DashboardApiService.getDashboardDataCached(params)
          : await DashboardApiService.getDashboardSummary(params);

      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period, includeCharts, enableCache]);

  const refetch = useCallback(() => fetchData(false), [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);
  const clearCache = useCallback(() => {
    DashboardApiService.clearCache();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    refresh,
    clearCache
  };
};

/**
 * Hook for dashboard statistics only (no charts)
 */
export const useDashboardStats = (period: DashboardPeriod = '30d') => {
  return useDashboard({ period, includeCharts: false });
};

/**
 * Hook for dashboard charts only
 */
export const useDashboardCharts = (period: DashboardPeriod = '30d') => {
  return useDashboard({ period, includeCharts: true });
};

/**
 * Hook for real-time dashboard updates
 */
export const useRealtimeDashboard = (period: DashboardPeriod = '30d') => {
  return useDashboard({ 
    period, 
    includeCharts: true, 
    autoRefresh: true, 
    refreshInterval: 60000, // 1 minute
    enableCache: false 
  });
};

export default useDashboard;



