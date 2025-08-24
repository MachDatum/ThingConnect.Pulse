import { Box, Heading, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { useParams } from 'react-router-dom'
import { Server, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default function EndpointDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <HStack gap={3} align="center">
          <Server size={24} />
          <Box>
            <Heading size="lg" color="blue.600" _dark={{ color: 'blue.400' }}>
              Endpoint Details
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              {id ? `Monitoring details for endpoint: ${id}` : 'Endpoint monitoring details'}
            </Text>
          </Box>
        </HStack>
      </Box>

      <Alert status="info">
        <Box>
          <Text fontWeight="semibold">Ready for Issue #19: Endpoint Detail Page</Text>
          <Text fontSize="sm" mt={1}>
            This placeholder will show detailed monitoring information for a specific endpoint,
            including recent state changes, response time history, and configuration details.
          </Text>
        </Box>
      </Alert>

      {/* Mock endpoint info */}
      <Box p={4} borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.800' }}>
        <Heading size="sm" mb={3}>Endpoint Information</Heading>
        <VStack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text>Endpoint ID:</Text>
            <Badge colorPalette="blue">{id || 'N/A'}</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Status:</Text>
            <Badge colorPalette="gray">Unknown</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Type:</Text>
            <Text fontSize="sm" color="gray.500">HTTP/HTTPS</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Last Check:</Text>
            <Text fontSize="sm" color="gray.500">Waiting for data...</Text>
          </HStack>
        </VStack>
      </Box>

      {/* Preview sections */}
      <VStack gap={4}>
        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <HStack gap={3} justify="center" color="gray.500" _dark={{ color: 'gray.400' }}>
            <TrendingUp size={32} />
            <Text>Response Time Chart (7-day history)</Text>
          </HStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <HStack gap={3} justify="center" color="gray.500" _dark={{ color: 'gray.400' }}>
            <AlertCircle size={32} />
            <Text>Recent State Changes & Outages</Text>
          </HStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <HStack gap={3} justify="center" color="gray.500" _dark={{ color: 'gray.400' }}>
            <Clock size={32} />
            <Text>Uptime Statistics</Text>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  )
}