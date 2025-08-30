import { Box, VStack, HStack, Text, Button, Spinner } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PageContentProps {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function PageContent({ 
  loading, 
  error, 
  empty, 
  emptyMessage = 'No data available', 
  onRetry,
  children 
}: PageContentProps) {
  // Error state
  if (error && !loading) {
    return (
      <Alert status="error" py={3}>
        <VStack align="start" gap={2} w="full">
          <Text fontWeight="semibold" fontSize="sm">
            {error.message || 'An unexpected error occurred'}
          </Text>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
            >
              <RefreshCw size={16} />
              Retry
            </Button>
          )}
        </VStack>
      </Alert>
    );
  }

  // Loading state
  if (loading && !children) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={8}
        data-testid="loading-state"
      >
        <HStack gap={3}>
          <Spinner size="sm" color="blue.500" />
          <Text fontSize="sm" color="gray.500">
            Loading...
          </Text>
        </HStack>
      </Box>
    );
  }

  // Empty state
  if (empty && !loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={8}
        data-testid="empty-state"
      >
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  // Content with optional loading overlay
  return (
    <Box position="relative" flex={1} data-testid="page-content">
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="white"
          _dark={{ bg: 'gray.900' }}
          opacity={0.8}
          zIndex={10}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <HStack gap={2}>
            <Spinner size="sm" color="blue.500" />
            <Text fontSize="sm" color="gray.500">
              Updating...
            </Text>
          </HStack>
        </Box>
      )}
      <VStack align="stretch" gap={2} h="full">
        {children}
      </VStack>
    </Box>
  );
}