import { QueryClient } from '@tanstack/react-query'

// Create query client with optimized defaults for monitoring app
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Monitoring data changes frequently, so shorter stale time
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors, but retry network/5xx errors
        const errorCode = (error as { code?: string })?.code
        if (errorCode && errorCode >= '400' && errorCode < '500') {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      // Automatically refetch when network comes back online
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Create and export singleton query client
export const queryClient = createQueryClient()