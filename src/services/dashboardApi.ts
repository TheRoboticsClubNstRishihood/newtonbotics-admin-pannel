import { getBackendUrl } from '../config/backend';
import { 
  DashboardApiResponse, 
  DashboardApiError, 
  DashboardApiParams, 
  DashboardData 
} from '../types/dashboard';

export class DashboardApiService {
  private static baseUrl = getBackendUrl();

  /**
   * Get dashboard summary data
   */
  static async getDashboardSummary(
    params: DashboardApiParams = {}
  ): Promise<DashboardData> {
    const { period = '30d', includeCharts = true } = params;
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use the local API route instead of external backend
    const url = new URL('/api/admin/dashboard/summary', window.location.origin);
    url.searchParams.append('period', period);
    url.searchParams.append('includeCharts', includeCharts.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: DashboardApiError = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }

      const data: DashboardApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data with caching
   */
  static async getDashboardDataCached(
    params: DashboardApiParams = {},
    cacheKey?: string
  ): Promise<DashboardData> {
    const key = cacheKey || `dashboard-${params.period || '30d'}-${params.includeCharts || true}`;
    const cached = this.getFromCache(key);
    
    if (cached) {
      return cached;
    }

    const data = await this.getDashboardSummary(params);
    this.setCache(key, data);
    return data;
  }

  /**
   * Clear dashboard cache
   */
  static clearCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('dashboard-'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get data from cache
   */
  private static getFromCache(key: string): DashboardData | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Cache expires after 5 minutes
      if (now - data.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  private static setCache(key: string, data: DashboardData): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Refresh dashboard data (bypass cache)
   */
  static async refreshDashboardData(params: DashboardApiParams = {}): Promise<DashboardData> {
    const key = `dashboard-${params.period || '30d'}-${params.includeCharts || true}`;
    localStorage.removeItem(key);
    return this.getDashboardSummary(params);
  }

  /**
   * Get user statistics only (without charts)
   */
  static async getUserStatistics(period: DashboardApiParams['period'] = '30d'): Promise<DashboardData> {
    return this.getDashboardSummary({ period, includeCharts: false });
  }

  /**
   * Get chart data only
   */
  static async getChartData(period: DashboardApiParams['period'] = '30d'): Promise<DashboardData> {
    return this.getDashboardSummary({ period, includeCharts: true });
  }
}

export default DashboardApiService;
