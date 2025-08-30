import { Box, HStack, Heading, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  actions, 
  compact = false 
}: PageHeaderProps) {
  if (compact) {
    return (
      <HStack
        justify="space-between"
        align="center"
        h="40px"
        py={1}
        data-testid="page-header"
      >
        <HStack gap={2} align="center" minW={0} flex={1}>
          {icon && (
            <Box
              color="blue.600"
              _dark={{ color: 'blue.400' }}
              flexShrink={0}
            >
              {icon}
            </Box>
          )}
          <Heading
            size="md"
            color="blue.600"
            _dark={{ color: 'blue.400' }}
            truncate
          >
            {title}
          </Heading>
          {description && (
            <Text
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
              truncate
              display={{ base: 'none', md: 'block' }}
            >
              {description}
            </Text>
          )}
        </HStack>
        {actions && (
          <Box flexShrink={0}>
            {actions}
          </Box>
        )}
      </HStack>
    );
  }

  return (
    <Box
      py={2}
      minH="48px"
      data-testid="page-header"
    >
      <HStack justify="space-between" align="start" gap={4}>
        <HStack gap={3} align="center" minW={0} flex={1}>
          {icon && (
            <Box
              color="blue.600"
              _dark={{ color: 'blue.400' }}
              flexShrink={0}
            >
              {icon}
            </Box>
          )}
          <Box minW={0} flex={1}>
            <Heading
              size="lg"
              color="blue.600"
              _dark={{ color: 'blue.400' }}
              truncate
              data-testid="page-title"
            >
              {title}
            </Heading>
            {description && (
              <Text
                fontSize="sm"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
                mt={1}
                lineClamp={2}
                data-testid="page-description"
              >
                {description}
              </Text>
            )}
          </Box>
        </HStack>
        {actions && (
          <Box flexShrink={0}>
            {actions}
          </Box>
        )}
      </HStack>
    </Box>
  );
}