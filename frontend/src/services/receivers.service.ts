import api, { ApiResponse, PaginatedResponse } from './api';
import { Receiver } from '@/types';

export class ReceiversService {
  /**
   * Get all receivers with optional pagination
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    senderId?: string;
  }): Promise<PaginatedResponse<Receiver>> {
    const response = await api.get('/api/receivers', { params });
    return response.data;
  }

  /**
   * Get receivers by sender ID
   */
  static async getBySenderId(senderId: string): Promise<ApiResponse<Receiver[]>> {
    const response = await api.get(`/api/receivers/sender/${senderId}`);
    return response.data;
  }

  /**
   * Get receiver by ID
   */
  static async getById(id: string): Promise<ApiResponse<Receiver>> {
    const response = await api.get(`/api/receivers/${id}`);
    return response.data;
  }

  /**
   * Create new receiver
   */
  static async create(data: Omit<Receiver, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Receiver>> {
    const response = await api.post('/api/receivers', data);
    return response.data;
  }

  /**
   * Update receiver
   */
  static async update(id: string, data: Partial<Receiver>): Promise<ApiResponse<Receiver>> {
    const response = await api.put(`/api/receivers/${id}`, data);
    return response.data;
  }

  /**
   * Deactivate receiver
   */
  static async deactivate(id: string): Promise<ApiResponse<Receiver>> {
    const response = await api.patch(`/api/receivers/${id}/deactivate`);
    return response.data;
  }

  /**
   * Delete receiver
   */
  static async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/receivers/${id}`);
    return response.data;
  }
}

export default ReceiversService;
