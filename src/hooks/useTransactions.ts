import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFilters, SendMoneyForm } from '@/types';
import { transactionsApi } from '@/services/api';

export function useTransactions(initialFilters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (newFilters?: TransactionFilters) => {
    setIsLoading(true);
    setError(null);
    
    const appliedFilters = newFilters ?? filters;
    const response = await transactionsApi.getAll(appliedFilters);
    
    if (response.success && response.data) {
      setTransactions(response.data);
    } else {
      setError(response.error || 'Failed to fetch transactions');
    }
    
    setIsLoading(false);
  }, [filters]);

  const createTransaction = useCallback(async (data: SendMoneyForm) => {
    const response = await transactionsApi.create(data);
    
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
