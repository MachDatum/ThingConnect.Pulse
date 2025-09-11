import { Box, Text, Badge, HStack, Center, Spinner } from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { LiveStatusItem } from '@/api/types';
import TrendBlocks from './TrendBlocks';

interface StatusTableProps {
  items: LiveStatusItem[];
  isLoading?: boolean;
}

export function StatusTable({ items, isLoading }: StatusTableProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      case 'flapping':
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
    void navigate(`/endpoints/${id}`);
  };
  console.log('isLoading in StatusTable:', items);
  return (
    <Box borderRadius='md' overflow='hidden'>
      {isLoading ? (
        <Center py={10}>
          <Spinner size='lg' color='blue.500' />
        </Center>
      ) : (
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
            {items?.map(item => (
              <Table.Row
                key={item.endpoint.id}
                cursor='pointer'
                _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
                onClick={() => handleRowClick(item.endpoint.id)}
              >
                <Table.Cell width='10%'>
                  <Badge
                    variant='subtle'
                    px={2}
                    py={1}
                    borderRadius='md'
                    fontSize='10px'
                    bg={`${getStatusColor(item.status)}.200`}
                    color={`${getStatusColor(item.status)}.600`}
                    _dark={{
                      bg: `${getStatusColor(item.status)}.700`,
                      color: `${getStatusColor(item.status)}.200`,
                    }}
                  >
                    {item.status.toUpperCase()}
                  </Badge>
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
                    color={item.rttMs ? 'inherit' : 'gray.500'}
                    _dark={{ color: item.rttMs ? 'inherit' : 'gray.400' }}
                  >
                    {formatRTT(item.rttMs)}
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
      )}
    </Box>
  );
}
