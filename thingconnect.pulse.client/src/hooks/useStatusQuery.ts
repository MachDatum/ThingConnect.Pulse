import { useQuery } from '@tanstack/react-query';
import { StatusService } from '@/api/services/status.service';
import type { LiveStatusParams } from '@/api/types';

export function useStatusQuery(params: LiveStatusParams = {}) {
  return useQuery({
    queryKey: ['live-status', params],
    queryFn: () => StatusService.getLiveStatus(params),
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
}
