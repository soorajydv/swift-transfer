import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { usersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useUsers() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await usersApi.getAll();
    
    if (response.success && response.data) {
      setUsers(response.data);
    } else {
      setError(response.error || 'Failed to fetch users');
    }
    
    setIsLoading(false);
  }, []);

  const createUser = useCallback(async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await usersApi.create({
      ...data,
      createdBy: authUser?.id,
    });
    
    if (response.success) {
      await fetchUsers();
    }
    
    return response;
  }, [authUser, fetchUsers]);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    const response = await usersApi.update(id, data, authUser?.id);
    
    if (response.success) {
      await fetchUsers();
    }
    
    return response;
  }, [authUser, fetchUsers]);

  const deactivateUser = useCallback(async (id: string) => {
    const response = await usersApi.deactivate(id, authUser?.id);
    
    if (response.success) {
      await fetchUsers();
    }
    
    return response;
  }, [authUser, fetchUsers]);

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
