import { Box, Text, VStack } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { Bell, Palette, Database } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { PageContent } from '@/components/layout/PageContent';

export default function Settings() {
  return (
    <Page
      title='Settings'
      testId='settings-page'
      description='Configure application preferences and system settings'
    >
      {/* <PageHeader
        title="Application Settings"
        description="Configure application preferences and system settings"
      /> */}

      <PageContent>
        <Alert status='info' py={2}>
          <Box>
            <Text fontWeight='medium' fontSize='sm'>
              Future Implementation
            </Text>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} mt={1}>
              Settings will be implemented as needed during development.
            </Text>
          </Box>
        </Alert>

        <VStack gap={2}>
          <Box
            p={4}
            borderRadius='md'
            border='2px dashed'
            borderColor='gray.300'
            _dark={{ borderColor: 'gray.600' }}
            w='100%'
          >
            <VStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
              <Bell size={24} />
              <Text textAlign='center' fontSize='sm'>
                <Text as='span' fontWeight='medium'>
                  Notification Settings
                </Text>
                <br />
                Configure alerts, email notifications, and sound preferences
              </Text>
            </VStack>
          </Box>

          <Box
            p={4}
            borderRadius='md'
            border='2px dashed'
            borderColor='gray.300'
            _dark={{ borderColor: 'gray.600' }}
            w='100%'
          >
            <VStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
              <Palette size={24} />
              <Text textAlign='center' fontSize='sm'>
                <Text as='span' fontWeight='medium'>
                  Display Preferences
                </Text>
                <br />
                Theme selection, refresh intervals, and dashboard layout options
              </Text>
            </VStack>
          </Box>

          <Box
            p={4}
            borderRadius='md'
            border='2px dashed'
            borderColor='gray.300'
            _dark={{ borderColor: 'gray.600' }}
            w='100%'
          >
            <VStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
              <Database size={24} />
              <Text textAlign='center' fontSize='sm'>
                <Text as='span' fontWeight='medium'>
                  System Information
                </Text>
                <br />
                Database status, service information, and application version details
              </Text>
            </VStack>
          </Box>
        </VStack>
      </PageContent>
    </Page>
  );
}
