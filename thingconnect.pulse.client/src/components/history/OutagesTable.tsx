import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  Text,
  Badge,
  VStack,
  IconButton,
  Pagination,
  ButtonGroup,
  Skeleton,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Outage } from '@/api/types';
import { Tooltip } from '../ui/tooltip';

export interface OutagesTableProps {
  outages?: Outage[] | null;
  pageSize?: number;
  isLoading?: boolean;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return 'Unknown';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function OutagesTable({ outages, pageSize = 20, isLoading }: OutagesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedOutages = useMemo(
    () =>
      [...(outages ?? [])].sort(
        (a, b) => new Date(b.startedTs).getTime() - new Date(a.startedTs).getTime()
      ),
    [outages]
  );

  const totalPages = Math.ceil(sortedOutages.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedOutages.slice(startIndex, startIndex + pageSize);
  }, [sortedOutages, currentPage, pageSize]);

  if (!isLoading && sortedOutages.length === 0) {
    return (
      <Box
        p={8}
        textAlign='center'
        bg='gray.50'
        borderRadius='md'
        border='2px dashed'
        borderColor='gray.300'
        _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
        h='full'
      >
        <VStack gap={3}>
          <Clock size={32} color='#9CA3AF' />
          <Text color='gray.500' _dark={{ color: 'gray.400' }}>
            No outages recorded
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack flex={1} minH={0} align='stretch' gap={2}>
      <Table.ScrollArea borderWidth='1px' rounded='md' flex={1} minH={0} overflow='auto'>
        <Table.Root size='sm' stickyHeader>
          <Table.Header>
            <Table.Row bg='gray.100' _dark={{ bg: 'gray.800' }}>
              <Table.ColumnHeader>Start Time</Table.ColumnHeader>
              <Table.ColumnHeader>Ended</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Duration</Table.ColumnHeader>
              <Table.ColumnHeader>Error</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Table.Row key={`skeleton-${i}`}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Table.Cell key={j}>
                        <Skeleton height='16px' w='80%' />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              : paginatedData.map((outage, idx) => (
                  <Table.Row key={`${outage.startedTs}-${idx}`}>
                    <Table.Cell>
                      <Text fontSize='sm' fontFamily='mono'>
                        {new Date(outage.startedTs).toLocaleString()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {outage.endedTs ? (
                        <Text fontSize='sm' fontFamily='mono'>
                          {new Date(outage.endedTs).toLocaleString()}
                        </Text>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={outage.endedTs ? 'green' : 'red'} size='sm'>
                        {outage.endedTs ? 'Resolved' : 'Ongoing'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize='sm'>{formatDuration(outage.durationS)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Tooltip content={outage.lastError || '-'}>
                        <Text
                          maxW={'3xs'}
                          fontSize='sm'
                          color={outage.lastError ? 'red.600' : 'gray.500'}
                          _dark={{ color: outage.lastError ? 'red.400' : 'gray.400' }}
                          overflow='hidden'
                          textOverflow='ellipsis'
                          whiteSpace='nowrap'
                        >
                          {outage.lastError || '-'}
                        </Text>
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {!isLoading && totalPages > 1 && (
        <Box flexShrink={0}>
          <Pagination.Root
            count={sortedOutages.length}
            pageSize={pageSize}
            page={currentPage}
            onPageChange={details => setCurrentPage(details.page)}
          >
            <ButtonGroup variant='ghost' size='sm' w='full' justifyContent='center'>
              <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} flex='1'>
                {sortedOutages.length > 0
                  ? `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                      currentPage * pageSize,
                      sortedOutages.length
                    )} of ${sortedOutages.length} outages`
                  : `0 of 0`}
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
    </VStack>
  );
}
