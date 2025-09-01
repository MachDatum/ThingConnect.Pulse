import { Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: (string | null | undefined)[];
  tos?: string[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box mt={2} w={'full'} pb='2' position={'sticky'} top={0} minH='48px' data-testid='page-header'>
      <Flex direction={'column'} w={'full'}>
        <Flex direction='row' alignItems='center' gap={2}>
          <HStack flex={1}>
            <Heading size='2xl' color={'gray.900'} data-testid='page-title'>
              {title}
            </Heading>
          </HStack>
          {actions && <HStack>{actions}</HStack>}
        </Flex>
        {description && (
          <Text fontSize='sm' color='gray.600' data-testid='page-description'>
            {description}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
