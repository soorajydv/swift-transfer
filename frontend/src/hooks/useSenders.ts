import { useState, useCallback, useEffect } from 'react';
import { Sender } from '@/types';
import SendersService from '@/services/senders.service';
import { useAuth } from '@/contexts/AuthContext';

export function useSenders(enabled: boolean = true) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchSenders = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await SendersService.getAll();

    if (response.success && response.data) {
      // Handle paginated response
      const data = (response.data as any).items || response.data;
      setSenders(Array.isArray(data) ? data : []);
    } else {
      setError(response.error || 'Failed to fetch senders');
    }

    setIsLoading(false);
  }, [isAuthenticated, enabled]);

  const createSender = useCallback(async (data: Omit<Sender, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await SendersService.create({
      ...data,
      createdBy: authUser?.id,
    });

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [authUser, fetchSenders]);

  const updateSender = useCallback(async (id: string, data: Partial<Sender>) => {
    const response = await SendersService.update(id, data);

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [fetchSenders]);

  const deactivateSender = useCallback(async (id: string) => {
    const response = await SendersService.deactivate(id);

    if (response.success) {
      await fetchSenders();
    }

    return response;
  }, [fetchSenders]);

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
