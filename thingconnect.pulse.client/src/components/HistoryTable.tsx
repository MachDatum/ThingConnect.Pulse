import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  Pagination,
  ButtonGroup,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { RollupBucket, DailyBucket, RawCheck } from '@/api/types';
import type { BucketType } from '@/types/bucket';

export interface HistoryTableProps {
  data: {
    raw: RawCheck[];
    rollup15m: RollupBucket[];
    rollupDaily: DailyBucket[];
  };
  bucket: BucketType;
  pageSize?: number;
}

export function HistoryTable({ data, bucket, pageSize = 20 }: HistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const tableData = useMemo(() => {
    switch (bucket) {
      case 'raw':
        return data.raw
          .map(check => ({
            timestamp: check.ts,
            displayTime: new Date(check.ts).toLocaleString(),
            status: check.status,
            responseTime: check.rttMs,
            error: check.error,
            type: 'raw' as const,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      case '15m':
        return data.rollup15m
          .map(bucket => ({
            timestamp: bucket.bucketTs,
            displayTime: new Date(bucket.bucketTs).toLocaleString(),
            uptime: bucket.upPct,
            responseTime: bucket.avgRttMs,
            downEvents: bucket.downEvents,
            type: '15m' as const,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      case 'daily':
        return data.rollupDaily
          .map(bucket => ({
            timestamp: bucket.bucketDate,
            displayTime: new Date(bucket.bucketDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            uptime: bucket.upPct,
            responseTime: bucket.avgRttMs,
            downEvents: bucket.downEvents,
            type: 'daily' as const,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      default:
        return [];
    }
  }, [data, bucket]);

  const totalPages = Math.ceil(tableData.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return tableData.slice(startIndex, startIndex + pageSize);
  }, [tableData, currentPage, pageSize]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const config = {
      up: { color: 'green', icon: CheckCircle },
      down: { color: 'red', icon: AlertCircle },
    }[status as 'up' | 'down'];

    if (!config) return <Badge>{status}</Badge>;
    const Icon = config.icon;
    return (
      <Badge colorPalette={config.color} size='sm'>
        <HStack gap={1}>
          <Icon size={12} />
          <Text>{status.toUpperCase()}</Text>
        </HStack>
      </Badge>
    );
  };

  const formatResponseTime = (rtt?: number | null) => {
    if (rtt === null || rtt === undefined) return '-';
    return `${rtt.toFixed(1)}ms`;
  };

  const formatUptime = (uptime?: number) => {
    if (uptime === undefined) return '-';
    return `${uptime.toFixed(1)}%`;
  };

  if (tableData.length === 0) {
    return (
      <Box
        p={8}
        textAlign='center'
        bg='gray.50'
        borderRadius='md'
        border='2px dashed'
        borderColor='gray.300'
        _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
      >
        <VStack gap={3}>
          <Clock size={32} color='#9CA3AF' />
          <Text color='gray.500' _dark={{ color: 'gray.400' }}>
            No historical data available
          </Text>
          <Text fontSize='sm' color='gray.400' _dark={{ color: 'gray.500' }}>
            Try adjusting your date range or check if monitoring is enabled for this endpoint
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap={2} align='stretch'>
      <Table.ScrollArea borderWidth='1px' rounded='md' height='100%'>
        <Table.Root size='sm' stickyHeader>
          <Table.Header>
            <Table.Row bg='gray.100' _dark={{ bg: 'gray.800' }}>
              <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
              {bucket === 'raw' ? (
                <>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Response Time</Table.ColumnHeader>
                  <Table.ColumnHeader>Error</Table.ColumnHeader>
                </>
              ) : (
                <>
                  <Table.ColumnHeader>Uptime</Table.ColumnHeader>
                  <Table.ColumnHeader>Avg Response Time</Table.ColumnHeader>
                  <Table.ColumnHeader>Down Events</Table.ColumnHeader>
                </>
              )}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedData.map(row => (
              <Table.Row key={`${row.timestamp}-${row.type}`}>
                <Table.Cell>
                  <Text fontSize='sm' fontFamily='mono'>
                    {row.displayTime}
                  </Text>
                </Table.Cell>

                {row.type === 'raw' ? (
                  <>
                    <Table.Cell>
                      {getStatusBadge('status' in row ? row.status : undefined)}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize='sm' fontFamily='mono'>
                        {formatResponseTime(row.responseTime)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        fontSize='sm'
                        color={'error' in row && row.error ? 'red.600' : 'gray.500'}
                        _dark={{ color: 'error' in row && row.error ? 'red.400' : 'gray.400' }}
                        maxW='200px'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        whiteSpace='nowrap'
                        title={'error' in row ? row.error || undefined : undefined}
                      >
                        {'error' in row ? row.error || '-' : '-'}
                      </Text>
                    </Table.Cell>
                  </>
                ) : (
                  <>
                    <Table.Cell>
                      <Badge
                        colorPalette={
                          'uptime' in row && row.uptime >= 99
                            ? 'green'
                            : 'uptime' in row && row.uptime >= 95
                              ? 'yellow'
                              : 'red'
                        }
                        size='sm'
                      >
                        {formatUptime('uptime' in row ? row.uptime : undefined)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize='sm' fontFamily='mono'>
                        {formatResponseTime(row.responseTime)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={'downEvents' in row && row.downEvents > 0 ? 'red' : 'green'}
                        size='sm'
                      >
                        {'downEvents' in row ? row.downEvents : 0}
                      </Badge>
                    </Table.Cell>
                  </>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination.Root
          count={tableData.length}
          pageSize={pageSize}
          page={currentPage}
          onPageChange={details => setCurrentPage(details.page)}
        >
          <ButtonGroup variant='ghost' size='sm' w='full' justifyContent='center'>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} flex='1'>
              Showing {currentPage * pageSize + 1}-
              {Math.min((currentPage + 1) * pageSize, tableData.length)} of {tableData.length}{' '}
              entries
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
      )}
    </VStack>
  );
}
