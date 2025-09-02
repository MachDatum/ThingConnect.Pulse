import { Box, VStack, Text, Spinner, Heading } from '@chakra-ui/react';
import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PageContentProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMsgHeader?: string;
  emptyMsgDescription?: string;
  onButton?: ReactNode;
  emptyIcon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  children: ReactNode;
}

export function PageContent({
  isLoading,
  isEmpty,
  emptyMsgHeader = 'No Data',
  emptyMsgDescription = 'No data available',
  onButton,
  emptyIcon: IconComponent = Inbox,
  iconSize = 96,
  iconColor = 'gray',
  children,
}: PageContentProps) {
  if (isEmpty && !isLoading) {
    return (
      <Box
        h={'100%'}
        display='flex'
        justifyContent='center'
        alignItems='center'
        data-testid='empty-state'
        background={'white'}
      >
        <VStack
          p={5}
          h={'full'}
          w={'100%'}
          border='1px solid'
          borderColor='gray.200'
          background={'white'}
          justifyContent='center'
          alignItems='center'
          borderRadius={'sm'}
        >
          {IconComponent && <IconComponent size={iconSize} stroke={iconColor} />}
          <Heading size='lg' color='gray.500'>
            {emptyMsgHeader}
          </Heading>
          <Text fontSize='sm' color='gray.500' textAlign='center'>
            {emptyMsgDescription}
          </Text>
          {onButton && (
            <Box mt={4} mb={4}>
              {onButton}
            </Box>
          )}
        </VStack>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        h={'100%'}
        display='flex'
        justifyContent='center'
        alignItems='center'
        data-testid='empty-state'
        position='relative'
      >
        <Box
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg='white'
          _dark={{ bg: 'gray.900' }}
          opacity={0.8}
          zIndex={10}
          display='flex'
          justifyContent='center'
          alignItems='center'
        >
          <VStack colorPalette='teal'>
            <Spinner color='blue.600' />
            <Text color='blue.600'>Loading...</Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Content with optional loading overlay
  return (
    <Box flex={1} data-testid='page-content'>
      <VStack align='stretch' gap={2} h='full' className='page-content'>
        {children}
      </VStack>
    </Box>
  );
}
