import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { PageContent } from './PageContent';
import { type LucideIcon } from 'lucide-react';

export interface PageProps {
  title: string;
  description?: ReactNode;
  testId?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyMsgHeader?: string;
  emptyMsgDescription?: string;
  onButton?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: (string | null | undefined)[];
  tos?: string[];
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
  breadcrumbs,
  tos,
}: PageProps) {
  return (
    <Flex direction={'column'} w='full' h='full' gap={2} id='page-container'>
      <Flex w='full' flex={'0 0 auto'} px={6}>
        <PageHeader
          title={title}
          description={description}
          actions={actions}
          breadcrumbs={breadcrumbs}
          tos={tos}
        />
      </Flex>
      <Box
        px={6}
        flex={'1 1 auto'}
        overflow={'auto'}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '4px',
            '&:hover': {
              background: 'gray.400',
            },
          },
        }}
        mb={2}
      >
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
