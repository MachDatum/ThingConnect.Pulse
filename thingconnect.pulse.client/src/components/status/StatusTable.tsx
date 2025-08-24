import { Box, Text, Badge, HStack } from '@chakra-ui/react'
import { Table } from '@chakra-ui/react'
import { MiniSparkline } from '@/components/charts/MiniSparkline'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import type { LiveStatusItem } from '@/api/types'

interface StatusTableProps {
  items: LiveStatusItem[]
  isLoading?: boolean
}

export function StatusTable({ items, isLoading }: StatusTableProps) {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'green'
      case 'down': return 'red'
      case 'flapping': return 'yellow'
      default: return 'gray'
    }
  }

  const formatRTT = (rtt?: number | null) => {
    if (rtt == null) return '-'
    return `${rtt}ms`
  }

  const formatLastChange = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const handleRowClick = (id: string) => {
    void navigate(`/endpoints/${id}`)
  }

  return (
    <Table.Root 
      variant="outline" 
      size="sm" 
      data-testid="status-table"
      striped
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Host</Table.ColumnHeader>
          <Table.ColumnHeader>Group</Table.ColumnHeader>
          <Table.ColumnHeader>RTT</Table.ColumnHeader>
          <Table.ColumnHeader>Last Change</Table.ColumnHeader>
          <Table.ColumnHeader>Trend</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      
      <Table.Body>
        {isLoading ? (
          // Loading skeleton rows
          Array.from({ length: 5 }).map((_, index) => (
            <Table.Row key={`loading-${index}`}>
              <Table.Cell>
                <Box w="16" h="6" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="32" h="4" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="24" h="4" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="20" h="4" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="16" h="4" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="28" h="4" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
              <Table.Cell>
                <Box w="20" h="5" bg="gray.200" _dark={{ bg: 'gray.600' }} borderRadius="md" />
              </Table.Cell>
            </Table.Row>
          ))
        ) : items.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={7}>
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No endpoints found</Text>
              </Box>
            </Table.Cell>
          </Table.Row>
        ) : (
          items.map((item) => (
            <Table.Row 
              key={item.endpoint.id}
              cursor="pointer"
              _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
              onClick={() => handleRowClick(item.endpoint.id)}
              data-testid={`status-row-${item.endpoint.id}`}
            >
              <Table.Cell>
                <Badge
                  colorPalette={getStatusColor(item.status)}
                  variant="subtle"
                  textTransform="uppercase"
                  fontSize="xs"
                  data-testid={`status-badge-${item.status}`}
                >
                  {item.status}
                </Badge>
              </Table.Cell>
              
              <Table.Cell>
                <Text fontWeight="medium" data-testid="endpoint-name">
                  {item.endpoint.name}
                </Text>
              </Table.Cell>
              
              <Table.Cell>
                <HStack gap={2}>
                  <Text fontFamily="mono" fontSize="sm" data-testid="endpoint-host">
                    {item.endpoint.host}
                  </Text>
                  {item.endpoint.port && (
                    <Text fontSize="xs" color="gray.500">
                      :{item.endpoint.port}
                    </Text>
                  )}
                </HStack>
              </Table.Cell>
              
              <Table.Cell>
                <Text fontSize="sm" data-testid="endpoint-group">
                  {item.endpoint.group.name}
                </Text>
              </Table.Cell>
              
              <Table.Cell>
                <Text 
                  fontFamily="mono" 
                  fontSize="sm"
                  color={item.rtt_ms ? 'inherit' : 'gray.400'}
                  data-testid="endpoint-rtt"
                >
                  {formatRTT(item.rtt_ms)}
                </Text>
              </Table.Cell>
              
              <Table.Cell>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {formatLastChange(item.last_change_ts)}
                </Text>
              </Table.Cell>
              
              <Table.Cell>
                <MiniSparkline data={item.sparkline} />
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  )
}