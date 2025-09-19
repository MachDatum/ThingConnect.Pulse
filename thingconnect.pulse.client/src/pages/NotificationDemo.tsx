import {
  VStack,
  HStack,
  Text,
  Box,
  Heading,
  Button,
  Code,
  Separator,
} from '@chakra-ui/react';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  NotificationBannerSimple,
  NotificationCenterSimple,
  NotificationBellSimple,
  NotificationTopBar,
} from '@/components/notifications';
import { useNotifications, useForceRefreshNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/api/types';

export default function NotificationDemo() {
  const { data: notifications } = useNotifications(true);
  const refreshMutation = useForceRefreshNotifications();

  // Sample notification for demo
  const sampleNotification: Notification = {
    id: 'demo-notification',
    type: 'release',
    priority: 'high',
    title: 'Demo Notification',
    message: 'This is a sample notification for demonstration purposes.',
    actionUrl: 'https://github.com/MachDatum/ThingConnect.Pulse',
    actionText: 'View Release',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    isRead: false,
    isShown: false,
    created: new Date().toISOString(),
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <Page title="Notification System Demo">
      <PageHeader
        title="Notification System Demo"
        description="Test and showcase the notification components"
        breadcrumbs={['Settings', 'Notification Demo']}
      />

      <VStack gap={8} align="stretch" maxW="4xl">
        {/* Notification Bell Demo */}
        <Box>
          <Heading size="md" mb={4}>Notification Bell</Heading>
          <Text mb={4} color="gray.600" _dark={{ color: 'gray.400' }}>
            Click the bell icon to see the notification popover (this one shows real notifications from your server):
          </Text>
          <HStack>
            <Text fontSize="sm">Notification Bell:</Text>
            <NotificationBellSimple size="md" showPopover={true} />
          </HStack>
        </Box>

        <Separator />

        {/* Sample Notification Banner */}
        <Box>
          <Heading size="md" mb={4}>Sample Notification Banner</Heading>
          <Text mb={4} color="gray.600" _dark={{ color: 'gray.400' }}>
            This is how individual notifications appear:
          </Text>
          <NotificationBannerSimple
            notification={sampleNotification}
            showCloseButton={true}
          />
        </Box>

        <Separator />

        {/* Top Bar Notification Demo */}
        <Box>
          <Heading size="md" mb={4}>Top Bar Notification</Heading>
          <Text mb={4} color="gray.600" _dark={{ color: 'gray.400' }}>
            High-priority notifications appear as top bars:
          </Text>
          <NotificationTopBar
            notification={{
              ...sampleNotification,
              type: 'maintenance',
              priority: 'critical',
              title: 'Critical System Update',
              message: 'Please update to the latest version immediately.',
            }}
          />
        </Box>

        <Separator />

        {/* Full Notification Center */}
        <Box>
          <Heading size="md" mb={4}>Notification Center</Heading>
          <Text mb={4} color="gray.600" _dark={{ color: 'gray.400' }}>
            Complete notification list with real data from your server:
          </Text>
          <Box
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            maxW="500px"
          >
            <NotificationCenterSimple
              includeRead={true}
              maxHeight="400px"
              showRefreshButton={true}
            />
          </Box>
        </Box>

        <Separator />

        {/* Configuration Info */}
        <Box>
          <Heading size="md" mb={4}>Configuration</Heading>
          <VStack align="stretch" gap={3}>
            <Box p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Server Endpoint:</Text>
              <Code fontSize="sm">
                https://thingconnect-pulse.s3.ap-south-1.amazonaws.com/notifications/latest.json
              </Code>
            </Box>

            <Box p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Fetch Interval:</Text>
              <Text fontSize="sm">Every 6 hours (automatic background sync)</Text>
            </Box>

            <Box p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Manual Refresh:</Text>
              <Button
                size="sm"
                onClick={handleRefresh}
                loading={refreshMutation.isPending}
                loadingText="Refreshing..."
              >
                Force Refresh Notifications
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Status */}
        <Box>
          <Heading size="md" mb={4}>Current Status</Heading>
          <VStack align="stretch" gap={2}>
            <HStack justifyContent="space-between">
              <Text>Total Notifications:</Text>
              <Text fontWeight="semibold">{notifications?.length || 0}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text>Unread Notifications:</Text>
              <Text fontWeight="semibold" color="blue.500">
                {notifications?.filter(n => !n.isRead).length || 0}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text>Last Refresh:</Text>
              <Text fontSize="sm" color="gray.500">
                {refreshMutation.isSuccess ? 'Just now' : 'Unknown'}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Page>
  );
}