import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFilters, SendMoneyForm } from '@/types';
import TransactionsService from '@/services/transactions.service';
import { useAuth } from '@/contexts/AuthContext';

export function useTransactions(initialFilters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (newFilters?: TransactionFilters) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const appliedFilters = newFilters ?? filters;
    const response = await TransactionsService.getAll(appliedFilters);

    if (response.success && response.data) {
      // Handle paginated response
      const data = (response.data as any).items || response.data;
      setTransactions(Array.isArray(data) ? data : []);
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

  const updateFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters, fetchTransactions]);

  return {
    transactions,
    filters,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateFilters,
    clearFilters,
  };
}
