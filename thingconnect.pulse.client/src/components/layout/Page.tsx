import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { PageContent } from './PageContent';
import { type LucideIcon } from 'lucide-react';

export interface PageProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyMsgHeader?: string;
  emptyMsgDescription?: string;
  onButton?: ReactNode;
  actions?: ReactNode;
}

export function Page({
  title,
  description,
  children,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyMsgHeader,
  emptyMsgDescription,
  onButton,
  actions,
}: PageProps) {
  return (
    <Flex direction={'column'} w='full' h='full' gap={2} id='page-container'>
      <Box position='sticky' top={0} zIndex={10} background={'white'}>
        <PageHeader title={title} description={description} actions={actions} />
      </Box>
      <Box h={'full'} w='full' flex={1} id='page-content'>
        <PageContent
          isLoading={isLoading}
          isEmpty={isEmpty}
          emptyIcon={emptyIcon}
          emptyMsgHeader={emptyMsgHeader}
          emptyMsgDescription={emptyMsgDescription}
          onButton={onButton}
        >
          {children}
        </PageContent>
      </Box>
    </Flex>
  );
}
