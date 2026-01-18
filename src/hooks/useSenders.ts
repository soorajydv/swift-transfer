import { useState, useCallback, useEffect } from 'react';
import { Sender } from '@/types';
import { sendersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useSenders() {
  const { user: authUser } = useAuth();
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await sendersApi.getAll();
    
    if (response.success && response.data) {
      setSenders(response.data);
    } else {
      setError(response.error || 'Failed to fetch senders');
    }
    
    setIsLoading(false);
  }, []);

  const createSender = useCallback(async (data: Omit<Sender, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await sendersApi.create({
      ...data,
      createdBy: authUser?.id,
    });
    
    if (response.success) {
      await fetchSenders();
    }
    
    return response;
  }, [authUser, fetchSenders]);

  const updateSender = useCallback(async (id: string, data: Partial<Sender>) => {
    const response = await sendersApi.update(id, data, authUser?.id);
    
    if (response.success) {
      await fetchSenders();
    }
    
    return response;
  }, [authUser, fetchSenders]);

  const deactivateSender = useCallback(async (id: string) => {
    const response = await sendersApi.deactivate(id, authUser?.id);
    
    if (response.success) {
      await fetchSenders();
    }
    
    return response;
  }, [authUser, fetchSenders]);

  useEffect(() => {
    fetchSenders();
  }, [fetchSenders]);

  return {
    senders,
    activeSenders: senders.filter(s => s.status === 'active'),
    isLoading,
    error,
    refetch: fetchSenders,
    createSender,
    updateSender,
    deactivateSender,
  };
}
