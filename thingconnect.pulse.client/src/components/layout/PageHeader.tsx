import { Box, HStack, Heading, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from "@/components/ui/tooltip"

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  info?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

export function PageHeader({
  title,
  description,
  icon,
  info,
  actions,
  compact = true,
}: PageHeaderProps) {
  if (compact) {
    return (
      <HStack justify='space-between' align='center' h='40px' py={1} data-testid='page-header'>
        <HStack gap={2} align='center' minW={0} flex={1}>
          {icon && (
            <Box color='gray.600' _dark={{ color: 'gray.400' }} flexShrink={0}>
              {icon}
            </Box>
          )}
          <HStack>
            <Heading size='xl' fontWeight={'bolder'} truncate>
              {title}
            </Heading>
            {info && (
                <Tooltip content={info} showArrow positioning={{ placement: "right-end" }}>
                  <Box as="span" color="gray.500" cursor="pointer">
                    <Info size={18} />
                  </Box>
                </Tooltip>
              )}
            </HStack>
          {description && (
            <Text
              fontSize='sm'
              color='gray.600'
              _dark={{ color: 'gray.400' }}
              truncate
              display={{ base: 'none', md: 'block' }}
            >
              {description}
            </Text>
          )}
        </HStack>
        {actions && <Box flexShrink={0}>{actions}</Box>}
      </HStack>
    );
  }

  return (
    <Box py={2} minH='48px' data-testid='page-header'>
      <HStack justify='space-between' align='start' gap={4}>
        <HStack gap={3} align='center' minW={0} flex={1}>
          {icon && <Box flexShrink={0}>{icon}</Box>}
          <Box minW={0} >
            <HStack>
            <Heading size='xl' fontWeight={'bolder'} truncate data-testid='page-title'>
              {title}
            </Heading>
            {info && (
              <Tooltip content={info} showArrow positioning={{ placement: "right-end" }}>
                <Box as="span" color="gray.500" cursor="pointer">
                  <Info size={18} />
                </Box>
              </Tooltip>
            )}
            </HStack>
            {description && (
              <Text
                fontSize='sm'
                color='gray.600'
                _dark={{ color: 'gray.400' }}
                mt={1}
                lineClamp={2}
                data-testid='page-description'
              >
                {description}
              </Text>
            )}
          </Box>
        </HStack>
        {actions && <Box flexShrink={0}>{actions}</Box>}
      </HStack>
    </Box>
  );
}
