import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { Settings as SettingsIcon, Bell, Palette, Database } from 'lucide-react';

export default function Settings() {
  return (
    <VStack gap={6} align='stretch' data-testid='settings-page'>
      <Box>
        <HStack gap={3} align='center'>
          <SettingsIcon size={24} />
          <Box>
            <Heading size='lg' color='blue.600' _dark={{ color: 'blue.400' }}>
              Application Settings
            </Heading>
            <Text color='gray.600' _dark={{ color: 'gray.400' }}>
              Configure application preferences and system settings
            </Text>
          </Box>
        </HStack>
      </Box>

      <Alert status='info'>
        <Box>
          <Text fontWeight='semibold'>Future Implementation</Text>
          <Text fontSize='sm' mt={1}>
            Application settings will be implemented as needed during development. This will include
            notification preferences, display options, and system configuration.
          </Text>
        </Box>
      </Alert>

      {/* Preview sections */}
      <VStack gap={4}>
        <Box
          p={6}
          borderRadius='md'
          border='2px dashed'
          borderColor='gray.300'
          _dark={{ borderColor: 'gray.600' }}
          w='100%'
        >
          <VStack gap={3} color='gray.500' _dark={{ color: 'gray.400' }}>
            <Bell size={32} />
            <Text textAlign='center'>
              <strong>Notification Settings</strong>
              <br />
              Configure alerts, email notifications, and sound preferences
            </Text>
          </VStack>
        </Box>

        <Box
          p={6}
          borderRadius='md'
          border='2px dashed'
          borderColor='gray.300'
          _dark={{ borderColor: 'gray.600' }}
          w='100%'
        >
          <VStack gap={3} color='gray.500' _dark={{ color: 'gray.400' }}>
            <Palette size={32} />
            <Text textAlign='center'>
              <strong>Display Preferences</strong>
              <br />
              Theme selection, refresh intervals, and dashboard layout options
            </Text>
          </VStack>
        </Box>

        <Box
          p={6}
          borderRadius='md'
          border='2px dashed'
          borderColor='gray.300'
          _dark={{ borderColor: 'gray.600' }}
          w='100%'
        >
          <VStack gap={3} color='gray.500' _dark={{ color: 'gray.400' }}>
            <Database size={32} />
            <Text textAlign='center'>
              <strong>System Information</strong>
              <br />
              Database status, service information, and application version details
            </Text>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  );
}
