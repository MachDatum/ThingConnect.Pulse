import { Box, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Clock, Download, Filter } from 'lucide-react'

export default function History() {
  return (
    <VStack gap={6} align="stretch" data-testid="history-page">
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

      <Alert status="info">
        <Box>
          <Text fontWeight="semibold">Ready for Issue #20: History View & CSV Export</Text>
          <Text fontSize="sm" mt={1}>
            This page will provide historical data visualization with filtering options
            and CSV export functionality for compliance and analysis purposes.
          </Text>
        </Box>
      </Alert>

      {/* Mock controls */}
      <Box p={4} borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.800' }}>
        <Heading size="sm" mb={3}>Data Controls</Heading>
        <VStack gap={4} align="stretch">
          <HStack justify="space-between">
            <HStack gap={2}>
              <Filter size={16} />
              <Text fontSize="sm">Available Filters:</Text>
            </HStack>
            <HStack gap={2}>
              <Badge colorPalette="gray" size="sm">Date Range</Badge>
              <Badge colorPalette="gray" size="sm">Endpoint</Badge>
              <Badge colorPalette="gray" size="sm">Status</Badge>
            </HStack>
          </HStack>
          
          <HStack justify="space-between">
            <HStack gap={2}>
              <Download size={16} />
              <Text fontSize="sm">Export Options:</Text>
            </HStack>
            <HStack gap={2}>
              <Badge colorPalette="gray" size="sm">CSV</Badge>
              <Badge colorPalette="gray" size="sm">PDF Report</Badge>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Preview sections */}
      <VStack gap={4}>
        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <Filter size={32} />
            <Text textAlign="center">
              <strong>Date Range & Filter Controls</strong><br />
              Select time periods, endpoints, and status filters
            </Text>
          </VStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <Clock size={32} />
            <Text textAlign="center">
              <strong>Historical Data Table</strong><br />
              Paginated table with endpoint status history, response times, and outage records
            </Text>
          </VStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <Download size={32} />
            <Text textAlign="center">
              <strong>Export Controls</strong><br />
              Download filtered data as CSV or generate PDF reports
            </Text>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  )
}