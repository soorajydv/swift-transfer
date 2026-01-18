import { useState, useCallback, useEffect } from 'react';
import ReceiversService from '@/services/receivers.service';
import { useAuth } from '@/contexts/AuthContext';
import { Receiver } from '@/types';

export function useReceivers(senderId?: string, enabled: boolean = true) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchReceivers = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = senderId
      ? await ReceiversService.getBySenderId(senderId)
      : await ReceiversService.getAll();

    if (response.success && response.data) {
      // Handle both paginated and direct array responses
      const data = senderId ? response.data : (response.data as any).items || response.data;
      setReceivers(Array.isArray(data) ? data : []);
    } else {
      setError(response.error || 'Failed to fetch receivers');
    }

    setIsLoading(false);
  }, [senderId, isAuthenticated, enabled]);

  const createReceiver = useCallback(async (data: Omit<Receiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await ReceiversService.create(data);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [authUser, fetchReceivers]);

  const updateReceiver = useCallback(async (id: string, data: Partial<Receiver>) => {
    const response = await ReceiversService.update(id, data);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [fetchReceivers]);

  const deactivateReceiver = useCallback(async (id: string) => {
    const response = await ReceiversService.deactivate(id);

    if (response.success) {
      await fetchReceivers();
    }

    return response;
  }, [fetchReceivers]);

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
