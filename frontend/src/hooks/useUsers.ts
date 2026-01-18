import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import UsersService from '@/services/users.service';
import { useAuth } from '@/contexts/AuthContext';

export function useUsers() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await UsersService.getAll();

    if (response.success && response.data) {
      // Handle paginated response
      const data = (response.data as any).items || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } else {
      setError(response.error || 'Failed to fetch users');
    }

    setIsLoading(false);
  }, [isAuthenticated]);

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
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
  };
}
