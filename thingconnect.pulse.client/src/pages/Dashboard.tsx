import { Box, Heading, Text, VStack, Badge } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Activity } from 'lucide-react'

export default function Dashboard() {
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

      <Alert status="info">
        <Box>
          <Text fontWeight="semibold">Ready for Issue #18: Live Board Page</Text>
          <Text fontSize="sm" mt={1}>
            This placeholder will be replaced with the live status board showing all monitored endpoints,
            their current status, response times, and real-time updates.
          </Text>
        </Box>
      </Alert>

      {/* Preview of what will be here */}
      <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }}>
        <VStack gap={4} align="center" color="gray.500" _dark={{ color: 'gray.400' }}>
          <Activity size={48} />
          <Text textAlign="center">
            <strong>Coming Soon:</strong><br />
            • Live endpoint grid with status indicators<br />
            • Real-time response time charts<br />
            • Outage alerts and notifications<br />
            • Group filtering and search<br />
            • Auto-refresh every 5 seconds
          </Text>
        </VStack>
      </Box>

      {/* Mock status summary */}
      <Box p={4} borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.800' }}>
        <Heading size="sm" mb={3}>System Overview</Heading>
        <VStack gap={2} align="stretch">
          <Box display="flex" justifyContent="space-between">
            <Text>Total Endpoints:</Text>
            <Badge colorPalette="blue">0</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Online:</Text>
            <Badge colorPalette="green">0</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Offline:</Text>
            <Badge colorPalette="red">0</Badge>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text>Last Updated:</Text>
            <Text fontSize="sm" color="gray.500">Waiting for backend...</Text>
          </Box>
        </VStack>
      </Box>
    </VStack>
  )
}