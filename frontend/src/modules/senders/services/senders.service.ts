import { api, ApiResponse, PaginatedResponse } from '@/shared/lib/api';
import { Sender } from '@/shared/types';

export class SendersService {
  /**
   * Get all senders with optional pagination
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Sender>> {
    const response = await api.get('/api/senders', { params });
    return response.data;
  }

  /**
   * Get sender by ID
   */
  static async getById(id: string): Promise<ApiResponse<Sender>> {
    const response = await api.get(`/api/senders/${id}`);
    return response.data;
  }

  /**
   * Create new sender
   */
  static async create(data: Omit<Sender, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'createdBy' | 'updatedBy'>): Promise<ApiResponse<Sender>> {
    const response = await api.post('/api/senders', data);
    return response.data;
  }

  /**
   * Update sender
   */
  static async update(id: string, data: Partial<Sender>): Promise<ApiResponse<Sender>> {
    const response = await api.put(`/api/senders/${id}`, data);
    return response.data;
  }

  /**
   * Deactivate sender
   */
  static async deactivate(id: string): Promise<ApiResponse<Sender>> {
    const response = await api.patch(`/api/senders/${id}/deactivate`);
    return response.data;
  }

  /**
   * Delete sender
   */
  static async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/senders/${id}`);
    return response.data;
  }
}

export default SendersService;
