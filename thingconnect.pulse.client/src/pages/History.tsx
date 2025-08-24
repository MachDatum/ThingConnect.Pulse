import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button,
  Card,
  Grid,
  GridItem,
  Spinner,
  Alert
} from '@chakra-ui/react'
import { Clock, Download, TrendingUp, AlertCircle } from 'lucide-react'

import { DateRangePicker } from '@/components/DateRangePicker'
import type { DateRange } from '@/components/DateRangePicker'
import { BucketSelector } from '@/components/BucketSelector'
import type { BucketType } from '@/components/BucketSelector'
import { AvailabilityChart, AvailabilityStats } from '@/components/AvailabilityChart'
import { HistoryTable } from '@/components/HistoryTable'
import { HistoryService } from '@/api/services/history.service'
import { StatusService } from '@/api/services/status.service'

export default function History() {
  // State for filters
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const defaultRange = HistoryService.getDefaultDateRange()
    return {
      from: defaultRange.from.slice(0, 16), // Format for datetime-local input
      to: defaultRange.to.slice(0, 16)
    }
  })
  const [bucket, setBucket] = useState<BucketType>('15m')
  const [isExporting, setIsExporting] = useState(false)

  // Get list of endpoints for the dropdown
  const { data: liveData } = useQuery({
    queryKey: ['live-status'],
    queryFn: () => StatusService.getLiveStatus({ pageSize: 100 }),
    staleTime: 30000
  })

  // Set first endpoint as default when loaded
  useEffect(() => {
    if (liveData?.items?.length && !selectedEndpoint) {
      setSelectedEndpoint(liveData.items[0].endpoint.id)
    }
  }, [liveData, selectedEndpoint])

  // Get historical data for selected endpoint
  const { 
    data: historyData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['history', selectedEndpoint, dateRange, bucket],
    queryFn: () => {
      if (!selectedEndpoint) return null
      
      return HistoryService.getEndpointHistory({
        id: selectedEndpoint,
        from: new Date(dateRange.from).toISOString(),
        to: new Date(dateRange.to).toISOString(),
        bucket
      })
    },
    enabled: !!selectedEndpoint,
    retry: 1
  })

  const handleExportCSV = async () => {
    if (!selectedEndpoint) return
    
    setIsExporting(true)
    try {
      await HistoryService.exportCSV({
        scope: 'endpoint',
        id: selectedEndpoint,
        from: new Date(dateRange.from).toISOString(),
        to: new Date(dateRange.to).toISOString(),
        bucket
      })
    } catch (err) {
      console.error('Export failed:', err)
      // Could add toast notification here
    } finally {
      setIsExporting(false)
    }
  }

  const selectedEndpointName = liveData?.items?.find(
    item => item.endpoint.id === selectedEndpoint
  )?.endpoint?.name || 'Unknown Endpoint'

  return (
    <VStack gap={6} align="stretch" data-testid="history-page">
      {/* Header */}
      <Box>
        <HStack gap={3} align="center">
          <Clock size={24} />
          <Box>
            <Heading size="lg" color="blue.600" _dark={{ color: 'blue.400' }}>
              Historical Data
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              View historical monitoring data and export reports
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Filter Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <Heading size="sm">Filters</Heading>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              <GridItem>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Endpoint
                </Text>
                <select 
                  value={selectedEndpoint} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEndpoint(e.target.value)}
                  style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  <option value="">Select endpoint...</option>
                  {liveData?.items?.map(item => (
                    <option key={item.endpoint.id} value={item.endpoint.id}>
                      {item.endpoint.name} ({item.endpoint.host})
                    </option>
                  ))}
                </select>
              </GridItem>
              
              <GridItem>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Date Range
                </Text>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </GridItem>
              
              <GridItem>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Data Granularity
                </Text>
                <BucketSelector
                  value={bucket}
                  onChange={setBucket}
                />
              </GridItem>
            </Grid>

            <HStack justify="flex-end" gap={3}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading || !selectedEndpoint}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                colorPalette="blue"
                onClick={handleExportCSV}
                loading={isExporting}
                disabled={!historyData || isLoading}
              >
                <Download size={16} />
                Export CSV
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Error State */}
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Box>
            <Alert.Title>Failed to load historical data</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </Text>
              <Button size="sm" variant="outline" onClick={() => refetch()} mt={2}>
                Try Again
              </Button>
            </Alert.Description>
          </Box>
        </Alert.Root>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card.Root>
          <Card.Body>
            <HStack justify="center" gap={3} py={8}>
              <Spinner size="sm" />
              <Text>Loading historical data for {selectedEndpointName}...</Text>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Data Display */}
      {historyData && !isLoading && (
        <>
          {/* Stats and Chart */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <GridItem>
              <Card.Root>
                <Card.Header>
                  <HStack gap={2}>
                    <TrendingUp size={20} />
                    <Heading size="sm">Availability Trend</Heading>
                  </HStack>
                </Card.Header>
                <Card.Body>
                  <AvailabilityChart
                    data={historyData}
                    bucket={bucket}
                    height={300}
                  />
                </Card.Body>
              </Card.Root>
            </GridItem>
            
            <GridItem>
              <AvailabilityStats data={historyData} bucket={bucket} />
            </GridItem>
          </Grid>

          {/* Data Table */}
          <Card.Root>
            <Card.Header>
              <HStack gap={2}>
                <AlertCircle size={20} />
                <Heading size="sm">Historical Data</Heading>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  ({selectedEndpointName})
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <HistoryTable
                data={historyData}
                bucket={bucket}
                pageSize={20}
              />
            </Card.Body>
          </Card.Root>
        </>
      )}

      {/* Empty State */}
      {!selectedEndpoint && !isLoading && (
        <Card.Root>
          <Card.Body>
            <VStack gap={3} py={8} color="gray.500" _dark={{ color: 'gray.400' }}>
              <Clock size={48} />
              <Text textAlign="center">
                Select an endpoint to view historical data
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  )
}