import { Box, VStack, HStack, Heading, Collapsible } from '@chakra-ui/react';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PageSectionProps {
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
  testId?: string;
}

export function PageSection({ 
  title, 
  collapsible = false, 
  defaultOpen = true, 
  children,
  testId
}: PageSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!title) {
    return (
      <Box data-testid={testId}>
        {children}
      </Box>
    );
  }

  if (collapsible) {
    return (
      <Box data-testid={testId}>
        <HStack
          as="button"
          onClick={() => setIsOpen(!isOpen)}
          justify="start"
          align="center"
          gap={1}
          py={1}
          w="full"
          textAlign="left"
          _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
          rounded="sm"
          px={1}
          h="32px"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Heading size="sm" fontSize="sm" fontWeight="medium">
            {title}
          </Heading>
        </HStack>
        <Collapsible.Root open={isOpen}>
          <Collapsible.Content>
            <VStack align="stretch" gap={2} pt={1}>
              {children}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={2} data-testid={testId}>
      <Heading
        size="sm"
        fontSize="sm"
        fontWeight="medium"
        py={1}
      >
        {title}
      </Heading>
      {children}
    </VStack>
  );
}