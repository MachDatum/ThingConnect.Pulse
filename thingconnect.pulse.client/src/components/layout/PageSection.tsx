import { Box, VStack, HStack, Heading, Collapsible, Button } from '@chakra-ui/react';
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
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant='ghost'
          justifyContent='flex-start'
          w='full'
          h='32px'
          px={1}
          py={1}
          rounded='sm'
          textAlign='left'
          _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Heading size='sm' fontSize='sm' fontWeight='medium' ml={2}>
            {title}
          </Heading>
        </Button>
        <Collapsible.Root open={isOpen}>
          <Collapsible.Content>
            <VStack align='stretch' gap={2} pt={1}>
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