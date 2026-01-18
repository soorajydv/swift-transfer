import api, { ApiResponse, PaginatedResponse } from './api';
import { User } from '@/types';

export class UsersService {
  /**
   * Get all users with optional pagination
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/api/users', { params });
    return response.data;
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  static async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    const response = await api.post('/api/users', data);
    return response.data;
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  }

  /**
   * Deactivate user
   */
  static async deactivate(id: string): Promise<ApiResponse<User>> {
    const response = await api.patch(`/api/users/${id}/deactivate`);
    return response.data;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  }
}

export default UsersService;
