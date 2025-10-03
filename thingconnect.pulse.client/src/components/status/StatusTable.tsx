import { Box, Text, Badge, HStack, Skeleton } from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { LiveStatusItem } from '@/api/types';
import TrendBlocks from './TrendBlocks';
import { Tooltip } from '../ui/tooltip';

interface StatusTableProps {
  items: LiveStatusItem[] | null | undefined;
  isLoading?: boolean;
}

export function StatusTable({ items, isLoading }: StatusTableProps) {
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      case 'flapping':
        return 'orange';
      case 'service':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatRTT = (rttMs?: number | null) => {
    if (rttMs == null) return '-';
    return `${rttMs}ms`;
  };

  const formatLastChange = (lastChangeTs: string) => {
    try {
      return formatDistanceToNow(new Date(lastChangeTs), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleRowClick = (id: string) => {
    // Track endpoint selection
    analytics.trackDashboardInteraction('endpoint_details_click', {
      table_type: 'status_overview',
      endpoint_id: id,
      source: 'main_dashboard',
    });

    void navigate(`/endpoints/${id}`);
  };

  return (
    <Box borderRadius='md' overflow='hidden'>
      <Table.Root size='md' borderWidth={0} width='full'>
        <Table.Header>
          <Table.Row fontSize='12px' fontWeight='bold' textTransform='uppercase'>
            <Table.ColumnHeader width='10%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader width='20%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Name
            </Table.ColumnHeader>
            <Table.ColumnHeader width='15%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Host
            </Table.ColumnHeader>
            <Table.ColumnHeader width='15%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Group
            </Table.ColumnHeader>
            <Table.ColumnHeader width='10%' color='gray.500' _dark={{ color: 'gray.400' }}>
              RTT
            </Table.ColumnHeader>
            <Table.ColumnHeader width='15%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Last Change
            </Table.ColumnHeader>
            <Table.ColumnHeader width='15%' color='gray.500' _dark={{ color: 'gray.400' }}>
              Trend
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {isLoading
            ? Array.from({ length: 10 }).map((_, rowIndex) => (
                <Table.Row key={`skeleton-${rowIndex}`}>
                  <Table.Cell width='10%'>
                    <Skeleton height='20px' width='60px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='20%'>
                    <Skeleton height='20px' width='120px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Skeleton height='20px' width='100px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Skeleton height='20px' width='80px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='10%'>
                    <Skeleton height='20px' width='50px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Skeleton height='20px' width='100px' borderRadius='md' />
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Skeleton height='20px' width='80px' borderRadius='md' />
                  </Table.Cell>
                </Table.Row>
              ))
            : items?.map(item => (
                <Table.Row
                  key={item.endpoint.id}
                  cursor='pointer'
                  _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
                  onClick={() => handleRowClick(item.endpoint.id)}
                >
                  <Table.Cell width='10%'>
                    {item.currentState.status === 'service' ? (
                      <Tooltip
                        content={`Http or Tcp is DOWN, but the host is reachable (ICMP succeeded).`}
                        showArrow
                      >
                        <Badge
                          variant='subtle'
                          px={2}
                          py={1}
                          borderRadius='md'
                          fontSize='10px'
                          colorPalette={getStatusColor(item.currentState.status)}
                          cursor='help'
                        >
                          {item.currentState.status.toUpperCase()}
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Badge
                        variant='subtle'
                        px={2}
                        py={1}
                        borderRadius='md'
                        fontSize='10px'
                        colorPalette={getStatusColor(item.currentState.status)}
                      >
                        {item.currentState.status.toUpperCase()}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell width='20%'>
                    <Text fontWeight='medium'>{item.endpoint.name}</Text>
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <HStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
                      <Text fontFamily='monospace' fontSize='sm'>
                        {item.endpoint.host}
                      </Text>
                      {item.endpoint.port && <Text fontSize='xs'>:{item.endpoint.port}</Text>}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Text fontSize='sm'>{item.endpoint.group.name}</Text>
                  </Table.Cell>
                  <Table.Cell width='10%'>
                    <Text
                      fontFamily='monospace'
                      fontSize='sm'
                      color={item.currentState.rttMs ? 'inherit' : 'gray.500'}
                      _dark={{ color: item.currentState.rttMs ? 'inherit' : 'gray.400' }}
                    >
                      {formatRTT(item.currentState.rttMs)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                      {formatLastChange(item.lastChangeTs)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell width='15%'>
                    <TrendBlocks data={item.sparkline} />
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
