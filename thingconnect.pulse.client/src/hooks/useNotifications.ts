import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/api/services/notification.service';

export function useNotifications(includeRead: boolean = false) {
  return useQuery({
    queryKey: ['notifications', includeRead],
    queryFn: () => NotificationService.getNotifications(includeRead),
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => NotificationService.getNotificationStats(),
    refetchInterval: 120000, // Refresh every 2 minutes
    refetchOnWindowFocus: true,
    staleTime: 60000, // Consider data stale after 1 minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markNotificationRead,
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useMarkNotificationShown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markNotificationShown,
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useForceRefreshNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.forceRefreshNotifications,
    onSuccess: () => {
      // Invalidate and refetch notification queries after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      }, 2000);
    },
  });
}