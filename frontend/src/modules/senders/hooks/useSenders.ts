import { useState, useCallback, useEffect } from 'react';
import { Sender } from '@/shared/types';
import SendersService from '@/modules/senders/services/senders.service';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface SenderFilters {
  search?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SenderPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useSenders(enabled: boolean = true, initialFilters?: Partial<SenderFilters>) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SenderFilters>({ page: 1, limit: 2, ...initialFilters });
  const [pagination, setPagination] = useState<SenderPagination | null>(null);

  const fetchSenders = useCallback(async (overrideFilters?: Partial<SenderFilters>) => {
    if (!isAuthenticated || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentFilters = { ...filters, ...overrideFilters };
    const response = await SendersService.getAll(currentFilters);

    if (response.success && response.data) {
      // Handle paginated response - check both formats
      const apiData = response.data as any;
      if (apiData.senders) {
        // Users format: { senders: [...], pagination: {...} }
        setSenders(apiData.senders);
        setPagination(apiData.pagination);
      } else if (apiData.items) {
        // Senders format: { items: [...], total: number, page: number, limit: number }
        setSenders(Array.isArray(apiData.items) ? apiData.items : []);
        // Convert senders pagination format to standard format
        const total = apiData.total || 0;
        const page = apiData.page || 1;
        const limit = apiData.limit || 2;
        const totalPages = Math.ceil(total / limit);
        setPagination({
          page,
          limit,
          totalCount: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        });
      } else {
        // Fallback
        setSenders(Array.isArray(apiData) ? apiData : []);
        setPagination(null);
      }
    } else {
      setError(response.error || 'Failed to fetch senders');
    }

    setIsLoading(false);
  }, [isAuthenticated, enabled, filters]);

  const createSender = useCallback(async (data: Omit<Sender, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'createdBy' | 'updatedBy'>) => {
    const response = await SendersService.create(data);

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [fetchSenders]);

  const updateSender = useCallback(async (id: string, data: Partial<Sender>) => {
    const response = await SendersService.update(id, data);

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [fetchSenders]);

  const deactivateSender = useCallback(async (id: string) => {
    const response = await SendersService.deactivate(id);

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [fetchSenders]);

  useEffect(() => {
    fetchSenders();
  }, [fetchSenders]);

  const updateFilters = useCallback((newFilters: Partial<SenderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, limit: 2 });
  }, []);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changeLimit = useCallback((limit: number) => {
    updateFilters({ page: 1, limit });
  }, [updateFilters]);

  return {
    senders,
    activeSenders: senders.filter(s => s.status === 'active'),
    isLoading,
    error,
    pagination,
    filters,
    refetch: fetchSenders,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    createSender,
    updateSender,
    deactivateSender,
  };
}
