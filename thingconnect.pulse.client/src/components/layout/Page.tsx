import { Box, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface PageProps {
  title?: string;
  testId?: string;
  children: ReactNode;
  compact?: boolean;
}

export function Page({ title, testId, children, compact = false }: PageProps) {
  // Set document title when provided
  useEffect(() => {
    if (title) {
      document.title = `${title} - ThingConnect Pulse`;
    }
  }, [title]);

  return (
    <Box
      data-testid={testId || 'page'}
      h="full"
      overflow="auto"
      p={{ base: 2, md: compact ? 2 : 4 }}
    >
      <VStack
        align="stretch"
        gap={compact ? 1 : 2}
        h="full"
        maxW="full"
      >
        {children}
      </VStack>
    </Box>
  );
}