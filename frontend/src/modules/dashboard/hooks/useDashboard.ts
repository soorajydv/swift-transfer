import { useState, useCallback, useEffect } from 'react';
import { DashboardStats } from '@/shared/types';
import DashboardService from '@/modules/dashboard/services/dashboard.service';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useDashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await DashboardService.getStats();

    if (response.success && response.data) {
      setStats(response.data);
    } else {
      setError(response.error || 'Failed to fetch stats');
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
