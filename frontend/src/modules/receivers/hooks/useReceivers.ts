import { useState, useCallback, useEffect } from 'react';
import ReceiversService from '@/modules/receivers/services/receivers.service';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Receiver } from '@/shared/types';

export interface ReceiverFilters {
  search?: string;
  status?: string;
  bank?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReceiverPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useReceivers(senderId?: string, enabled: boolean = true, initialFilters?: Partial<ReceiverFilters>) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReceiverFilters>({ page: 1, limit: 2, ...initialFilters });
  const [pagination, setPagination] = useState<ReceiverPagination | null>(null);

  const fetchReceivers = useCallback(async (overrideFilters?: Partial<ReceiverFilters>) => {
    if (!isAuthenticated || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentFilters = { ...filters, ...overrideFilters };
    const response = senderId
      ? await ReceiversService.getBySenderId(senderId)
      : await ReceiversService.getAll(currentFilters);

    if (response.success && response.data) {
      // Handle different response formats
      if (senderId) {
        // getBySenderId returns direct array
        setReceivers(Array.isArray(response.data) ? response.data : []);
        setPagination(null);
      } else {
        // getAll returns paginated format
        const apiData = response.data as any;
        if (apiData.items) {
          setReceivers(Array.isArray(apiData.items) ? apiData.items : []);
          // Convert to standard pagination format
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
          setReceivers(Array.isArray(apiData) ? apiData : []);
          setPagination(null);
        }
      }
    } else {
      setError(response.error || 'Failed to fetch receivers');
    }

    setIsLoading(false);
  }, [senderId, isAuthenticated, enabled, filters]);

  const createReceiver = useCallback(async (data: Omit<Receiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await ReceiversService.create(data);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [authUser, fetchReceivers]);

  const updateReceiver = useCallback(async (id: string, data: Partial<Receiver>) => {
    const response = await ReceiversService.update(id, data);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [fetchReceivers]);

  const deactivateReceiver = useCallback(async (id: string) => {
    const response = await ReceiversService.deactivate(id);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [fetchReceivers]);

  useEffect(() => {
    fetchReceivers();
  }, [fetchReceivers]);

  const updateFilters = useCallback((newFilters: Partial<ReceiverFilters>) => {
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
    receivers,
    activeReceivers: receivers.filter(r => r.status === 'active'),
    isLoading,
    error,
    pagination,
    filters,
    refetch: fetchReceivers,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    createReceiver,
    updateReceiver,
    deactivateReceiver,
  };
}
