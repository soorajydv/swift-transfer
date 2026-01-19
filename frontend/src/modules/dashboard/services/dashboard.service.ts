import { api } from '@/shared/lib/api';
import { DashboardStats } from '@/shared/types';

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  }

  /**
   * Get recent transactions
   */
  static async getRecentTransactions(limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await api.get('/api/dashboard/recent-transactions', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get activity summary
   */
  static async getActivitySummary(): Promise<ApiResponse<{
    todayTransactions: number;
    weekTransactions: number;
    monthTransactions: number;
    activeUsers: number;
  }>> {
    const response = await api.get('/api/dashboard/activity');
    return response.data;
  }

  /**
   * Get system health status
   */
  static async getHealthStatus(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'error';
    services: {
      database: boolean;
      redis: boolean;
      kafka: boolean;
    };
    uptime: number;
  }>> {
    const response = await api.get('/api/dashboard/health');
    return response.data;
  }
}

export default DashboardService;
