import {
  Box,
  Text,
  VStack,
  Badge,
  Table,
  Pagination,
  ButtonGroup,
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, CloudOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { RawCheck } from '@/api/types';
import { useMemo, useState } from 'react';
import { Tooltip } from './ui/tooltip';
interface RecentChecksTableProps {
  checks: RawCheck[];
  pageSize?: number;
}

export function RecentChecksTable({ checks, pageSize = 10 }: RecentChecksTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(checks.length / pageSize);
  const pagedChecks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return checks.slice(start, start + pageSize);
  }, [checks, currentPage, pageSize]);

  if (checks.length === 0) {
    return (
      <VStack
        justify='center'
        align='center'
        color='gray.300'
        textAlign='center'
        gap={1}
        py={5}
        h='100%'
      >
        <CloudOff size={'40px'} />
        <Text textAlign='center' color='gray.500'>
          No recent checks available
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap={2} align='stretch' h='100%' flex='1'>
      <Box flex='1' display='flex' flexDirection='column' minH={0}>
        <Table.ScrollArea borderWidth='1px' rounded='md' flex='1' minH={0} overflow='auto'>
          <Table.Root size='sm' stickyHeader>
            <Table.Header>
              <Table.Row bg='gray.100' _dark={{ bg: 'gray.800' }}>
                <Table.ColumnHeader w='30%'>Time</Table.ColumnHeader>
                <Table.ColumnHeader w='20%'>Status</Table.ColumnHeader>
                <Table.ColumnHeader w='25%'>RTT</Table.ColumnHeader>
                <Table.ColumnHeader w='25%'>Error</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pagedChecks.map((check, index) => (
                <Table.Row key={`${check.ts}-${index}`}>
                  <Table.Cell w='30%'>
                    <Text flex='1' fontSize='sm'>
                      {formatDistanceToNow(new Date(check.ts), { addSuffix: true })}
                    </Text>
                  </Table.Cell>
                  <Table.Cell w='20%'>
                    <Badge colorPalette={check.status === 'up' ? 'green' : 'red'} size='sm'>
                      {check.status.toUpperCase()}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell w='25%'>
                    <Text fontSize='sm'>{check.rttMs ? `${check.rttMs}ms` : '-'}</Text>
                  </Table.Cell>
                  <Table.Cell w='25%'>
                    <Tooltip content={check.error || '-'}>
                      <Text flex='1' fontSize='sm' color='gray.500' lineClamp={1}>
                        {check.error || '-'}
                      </Text>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>

        {/* Pagination fixed at bottom */}
        {pageCount > 1 && (
          <Box flexShrink={0} py={2}>
            <Pagination.Root
              count={checks.length}
              pageSize={pageSize}
              page={currentPage}
              onPageChange={details => setCurrentPage(details.page)}
            >
              <ButtonGroup variant='ghost' size='sm' w='full' justifyContent='center'>
                <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} flex='1'>
                  {`Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                    currentPage * pageSize,
                    checks.length
                  )} of ${checks.length} entries`}
                </Text>
                <Pagination.PrevTrigger asChild>
                  <IconButton aria-label='Previous page'>
                    <ChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.Items
                  render={page => (
                    <IconButton
                      key={page.value}
                      variant={page.value === currentPage ? 'outline' : 'ghost'}
                      size='sm'
                    >
                      {page.value}
                    </IconButton>
                  )}
                />
                <Pagination.NextTrigger asChild>
                  <IconButton aria-label='Next page'>
                    <ChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          </Box>
        )}
      </Box>
    </VStack>
  );
}
