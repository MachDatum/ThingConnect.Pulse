import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Wrench, FileText, Upload } from 'lucide-react'

export default function Config() {
  return (
    <VStack gap={6} align="stretch" data-testid="config-page">
      <Box>
        <HStack gap={3} align="center">
          <Wrench size={24} />
          <Box>
            <Heading size="lg" color="blue.600" _dark={{ color: 'blue.400' }}>
              Configuration Management
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Manage monitoring endpoints and YAML configuration
            </Text>
          </Box>
        </HStack>
      </Box>

      <Alert status="warning">
        <Box>
          <Text fontWeight="semibold">Future Implementation: Issue #21</Text>
          <Text fontSize="sm" mt={1}>
            Configuration management UI will be implemented after the core monitoring functionality.
            For now, configuration is managed via YAML files in the ProgramData folder.
          </Text>
        </Box>
      </Alert>

      {/* Preview sections */}
      <VStack gap={4}>
        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <FileText size={32} />
            <Text textAlign="center">
              <strong>YAML Configuration Editor</strong><br />
              Visual editor for monitoring endpoints, groups, and probe settings
            </Text>
          </VStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <Upload size={32} />
            <Text textAlign="center">
              <strong>Configuration Upload/Apply</strong><br />
              Upload new configuration files and apply changes to the monitoring system
            </Text>
          </VStack>
        </Box>

        <Box p={6} borderRadius="md" border="2px dashed" borderColor="gray.300" _dark={{ borderColor: 'gray.600' }} w="100%">
          <VStack gap={3} color="gray.500" _dark={{ color: 'gray.400' }}>
            <Wrench size={32} />
            <Text textAlign="center">
              <strong>Configuration Validation</strong><br />
              Real-time validation and testing of endpoint configurations
            </Text>
          </VStack>
        </Box>
      </VStack>

      <Box p={4} borderRadius="md" bg="blue.50" _dark={{ bg: 'blue.900' }}>
        <Text fontSize="sm" color="blue.800" _dark={{ color: 'blue.200' }}>
          <strong>Current Configuration Location:</strong><br />
          C:\ProgramData\ThingConnect.Pulse\config.yaml
        </Text>
      </Box>
    </VStack>
  )
}