import { User } from '@/shared/types';
import { useState, useCallback, useEffect } from 'react';
import UsersService from '@/modules/users/services/users.service';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useUsers(initialFilters?: UserFilters) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || { page: 1, limit: 2 });
  const [pagination, setPagination] = useState<UserPagination | null>(null);

  const fetchUsers = useCallback(async (overrideFilters?: Partial<UserFilters>) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setUsers([]);
      setPagination(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentFilters = { ...filters, ...overrideFilters };
    const response = await UsersService.getAll(currentFilters);

    if (response.success && response.data) {
      // Handle paginated response
      const apiData = response.data as any;
      if (apiData.users) {
        setUsers(apiData.users);
        setPagination(apiData.pagination);
      } else {
        setUsers(Array.isArray(apiData) ? apiData : []);
        setPagination(null);
      }
    } else {
      setError(response.error || 'Failed to fetch users');
    }

    setIsLoading(false);
  }, [isAuthenticated, filters]);

  const createUser = useCallback(async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await UsersService.create({
      ...data,
      createdBy: authUser?.id,
    });

    if (response.success) {
      await fetchUsers();
    }

    return response;
  }, [authUser, fetchUsers]);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    const response = await UsersService.update(id, data);

    if (response.success) {
      await fetchUsers();
    }

    return response;
  }, [fetchUsers]);

  const deactivateUser = useCallback(async (id: string) => {
    const response = await UsersService.deactivate(id);

    if (response.success) {
      await fetchUsers();
    }

    return response;
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filters]);

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters || { page: 1, limit: 2 });
  }, [initialFilters]);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changeLimit = useCallback((limit: number) => {
    updateFilters({ page: 1, limit });
  }, [updateFilters]);

  return {
    users,
    isLoading,
    error,
    pagination,
    filters,
    refetch: fetchUsers,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    createUser,
    updateUser,
    deactivateUser,
  };
}
