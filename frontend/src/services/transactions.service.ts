import api, { ApiResponse, PaginatedResponse } from './api';
import { Transaction, SendMoneyForm, TransactionFilters } from '@/types';

export class TransactionsService {
  /**
   * Get all transactions with optional filters and pagination
   */
  static async getAll(filters?: TransactionFilters, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Transaction>> {
    const queryParams = { ...params };
    if (filters) {
      Object.assign(queryParams, filters);
    }
    const response = await api.get('/api/transactions', { params: queryParams });
    return response.data;
  }

  /**
   * Get transaction by ID
   */
  static async getById(id: string): Promise<ApiResponse<Transaction>> {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  }

  /**
   * Create new transaction
   */
  static async create(data: SendMoneyForm): Promise<ApiResponse<Transaction>> {
    const response = await api.post('/api/transactions', data);
    return response.data;
  }

  /**
   * Update transaction status
   */
  static async updateStatus(id: string, status: string, notes?: string): Promise<ApiResponse<Transaction>> {
    const response = await api.patch(`/api/transactions/${id}/status`, { status, notes });
    return response.data;
  }

  /**
   * Cancel transaction
   */
  static async cancel(id: string, reason?: string): Promise<ApiResponse<Transaction>> {
    const response = await api.patch(`/api/transactions/${id}/cancel`, { reason });
    return response.data;
  }

  /**
   * Get transaction statistics
   */
  static async getStats(dateRange?: { startDate: string; endDate: string }): Promise<ApiResponse<{
    totalAmount: number;
    totalTransactions: number;
    successRate: number;
    averageAmount: number;
  }>> {
    const response = await api.get('/api/transactions/stats', { params: dateRange });
    return response.data;
  }
}

export default TransactionsService;
