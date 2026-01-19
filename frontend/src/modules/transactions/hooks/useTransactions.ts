import { useAuth } from '@/shared/contexts/AuthContext';
import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFilters, SendMoneyForm } from '@/shared/types';
import TransactionsService from '@/modules/transactions/services/transactions.service';

export interface TransactionPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useTransactions(initialFilters?: TransactionFilters, autoFetch: boolean = true) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || { page: 1, limit: 2 });
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TransactionPagination | null>(null);

  const fetchTransactions = useCallback(async (newFilters?: TransactionFilters) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const appliedFilters = newFilters ?? filters;
    const response = await TransactionsService.getAll(appliedFilters);

    if (response.success && response.data) {
      // Handle paginated response
      const apiData = response.data as any;
      if (apiData.items) {
        // Paginated response format: { items: [...], total: number, page: number, limit: number }
        setTransactions(Array.isArray(apiData.items) ? apiData.items : []);
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
        // Fallback for non-paginated response
        setTransactions(Array.isArray(apiData) ? apiData : []);
        setPagination(null);
      }
    } else {
      setError(response.error || 'Failed to fetch transactions');
    }

    setIsLoading(false);
  }, [filters, isAuthenticated]);

  const createTransaction = useCallback(async (data: SendMoneyForm) => {
    const response = await TransactionsService.create(data);

    if (response.success) {
      await fetchTransactions();
    }

    return response;
  }, [fetchTransactions]);

  const updateTransactionStatus = useCallback(async (id: string, status: string, notes?: string) => {
    const response = await TransactionsService.updateStatus(id, status, notes);

    if (response.success) {
      await fetchTransactions();
    }

    return response;
  }, [fetchTransactions]);

  const cancelTransaction = useCallback(async (id: string, reason?: string) => {
    const response = await TransactionsService.cancel(id, reason);

    if (response.success) {
      await fetchTransactions();
    }

    return response;
  }, [fetchTransactions]);

  const updateFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    } else {
      setIsLoading(false);
    }
  }, [filters, fetchTransactions, autoFetch]);

  const changePage = useCallback((page: number) => {
    updateFilters({ ...filters, page });
  }, [filters, updateFilters]);

  const changeLimit = useCallback((limit: number) => {
    updateFilters({ ...filters, page: 1, limit });
  }, [filters, updateFilters]);

  return {
    transactions,
    filters,
    pagination,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransactionStatus,
    cancelTransaction,
    updateFilters,
    clearFilters,
    changePage,
    changeLimit,
  };
}
