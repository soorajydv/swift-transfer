import { useState, useCallback, useEffect } from 'react';
import { Receiver } from '@/types';
import { receiversApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useReceivers(senderId?: string) {
  const { user: authUser } = useAuth();
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceivers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const response = senderId 
      ? await receiversApi.getBySenderId(senderId)
      : await receiversApi.getAll();
    
    if (response.success && response.data) {
      setReceivers(response.data);
    } else {
      setError(response.error || 'Failed to fetch receivers');
    }
    
    setIsLoading(false);
  }, [senderId]);

  const createReceiver = useCallback(async (data: Omit<Receiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await receiversApi.create({
      ...data,
      createdBy: authUser?.id,
    });
    
    if (response.success) {
      await fetchReceivers();
    }
    
    return response;
  }, [authUser, fetchReceivers]);

  const updateReceiver = useCallback(async (id: string, data: Partial<Receiver>) => {
    const response = await receiversApi.update(id, data, authUser?.id);
    
    if (response.success) {
      await fetchReceivers();
    }
    
    return response;
  }, [authUser, fetchReceivers]);

  const deactivateReceiver = useCallback(async (id: string) => {
    const response = await receiversApi.deactivate(id, authUser?.id);
    
    if (response.success) {
      await fetchReceivers();
    }
    
    return response;
  }, [authUser, fetchReceivers]);

  useEffect(() => {
    fetchReceivers();
  }, [fetchReceivers]);

  return {
    receivers,
    activeReceivers: receivers.filter(r => r.status === 'active'),
    isLoading,
    error,
    refetch: fetchReceivers,
    createReceiver,
    updateReceiver,
    deactivateReceiver,
  };
}
