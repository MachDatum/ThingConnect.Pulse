import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box mt={2} w={'full'} pb='2' position={'sticky'} top={0} minH='48px' data-testid='page-header'>
      <HStack flex={1}>
        <VStack align='start' gap={1} minW={0} flex={1}>
          <Heading size='2xl' color={'gray.900'} data-testid='page-title'>
            {title}
          </Heading>
          {description && (
            <Text fontSize='sm' color='gray.600' data-testid='page-description'>
              {description}
            </Text>
          )}
        </VStack>
        {actions && <HStack>{actions}</HStack>}
      </HStack>
    </Box>
  );
}
