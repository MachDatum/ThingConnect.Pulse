import { Box, Heading, Text, VStack, Badge, Grid, useBreakpointValue } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Loader } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useStatusQuery } from '@/hooks/useStatusQuery'
import { StatusFilters } from '@/components/status/StatusFilters'
import { StatusTable } from '@/components/status/StatusTable'
import { StatusCard } from '@/components/status/StatusCard'
import { StatusPagination } from '@/components/status/StatusPagination'
import type { LiveStatusParams } from '@/api/types'

export default function Dashboard() {
  const [filters, setFilters] = useState<LiveStatusParams>({
    page: 1,
    pageSize: 50
  })

  const { data, error, isLoading, isError } = useStatusQuery(filters)
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Extract unique groups for filter dropdown
  const groups = useMemo(() => {
    if (!data?.items) return []
    const groupSet = new Set(data.items.map(item => item.endpoint.group.name))
    return Array.from(groupSet).sort()
  }, [data?.items])

  // Count status totals
  const statusCounts = useMemo(() => {
    if (!data?.items) return { total: 0, up: 0, down: 0, flapping: 0 }
    
    const counts = data.items.reduce(
      (acc, item) => {
        acc.total++
        acc[item.status]++
        return acc
      },
      { total: 0, up: 0, down: 0, flapping: 0 }
    )
    
    return counts
  }, [data?.items])

  const handleFiltersChange = (newFilters: LiveStatusParams) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }))
  }

  return (
    <VStack gap={6} align="stretch" data-testid="dashboard-page">
      <Box data-testid="dashboard-header">
        <Heading size="lg" color="blue.600" _dark={{ color: 'blue.400' }} data-testid="page-title">
          Network Status Dashboard
        </Heading>
        <Text color="gray.600" _dark={{ color: 'gray.400' }} data-testid="page-description">
          Real-time monitoring of network endpoints
        </Text>
      </Box>

      {/* System Overview */}
      <Box p={4} borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.800' }}>
        <Heading size="sm" mb={3}>System Overview</Heading>
        <VStack gap={2} align="stretch">
          <Box display="flex" justifyContent="space-between">
            <Text>Total Endpoints:</Text>
            <Badge colorPalette="blue">{statusCounts.total}</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Online:</Text>
            <Badge colorPalette="green">{statusCounts.up}</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Offline:</Text>
            <Badge colorPalette="red">{statusCounts.down}</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Flapping:</Text>
            <Badge colorPalette="yellow">{statusCounts.flapping}</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Last Updated:</Text>
            <Text fontSize="sm" color="gray.500">
              {isLoading ? 'Updating...' : 'Just now'}
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Filters */}
      <StatusFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        groups={groups}
      />

      {/* Error State */}
      {isError && (
        <Alert status="error">
          <Box>
            <Text fontWeight="semibold">Failed to load endpoint status</Text>
            <Text fontSize="sm" mt={1}>
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </Text>
          </Box>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <Box textAlign="center" py={8}>
          <VStack gap={4}>
            <Loader size={24} className="animate-spin" />
            <Text color="gray.500">Loading endpoint status...</Text>
          </VStack>
        </Box>
      )}

      {/* Data Display */}
      {data && (
        <>
          {isMobile ? (
            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={4}>
              {data.items.map(item => (
                <StatusCard key={item.endpoint.id} item={item} />
              ))}
            </Grid>
          ) : (
            <Box overflowX="auto">
              <StatusTable items={data.items} isLoading={isLoading} />
            </Box>
          )}

          {/* Pagination */}
          <StatusPagination
            meta={data.meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </VStack>
  )
}