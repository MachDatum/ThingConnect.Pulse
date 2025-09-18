import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { Bell, BellOff, RefreshCw } from 'lucide-react';
import { NotificationBannerSimple } from './NotificationBannerSimple';
import { useNotifications, useForceRefreshNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  includeRead?: boolean;
  maxHeight?: string;
  showRefreshButton?: boolean;
}

export const NotificationCenterSimple: React.FC<NotificationCenterProps> = ({
  includeRead = false,
  maxHeight = '400px',
  showRefreshButton = false,
}) => {
  const { data: notifications, isLoading, error, refetch } = useNotifications(includeRead);
  const refreshMutation = useForceRefreshNotifications();

  const handleRefresh = async () => {
    if (showRefreshButton) {
      await refreshMutation.mutateAsync();
    }
    refetch();
  };

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
  const readNotifications = notifications?.filter(n => n.isRead) || [];

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" />
        <Text mt={2}>Loading notifications...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500" textAlign="center">
          Failed to load notifications. Please try again.
        </Text>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          mt={2}
          width="100%"
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <BellOff size={48} style={{ margin: '0 auto 16px', color: 'gray' }} />
        <Text fontWeight="semibold" mb={2}>No notifications</Text>
        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
          You are all caught up! Check back later for updates.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justifyContent="space-between" p={4} borderBottomWidth={1}>
        <HStack>
          <Bell size={20} />
          <Text fontWeight="semibold">Notifications</Text>
          {unreadNotifications.length > 0 && (
            <Box
              bg="red.500"
              color="white"
              borderRadius="full"
              minW={5}
              h={5}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
            >
              {unreadNotifications.length}
            </Box>
          )}
        </HStack>

        {showRefreshButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        )}
      </HStack>

      {/* Notifications List */}
      <Box maxHeight={maxHeight} overflowY="auto">
        <VStack gap={0} align="stretch">
          {/* Unread notifications first */}
          {unreadNotifications.map((notification) => (
            <Box key={notification.id} p={3} borderBottomWidth={1}>
              <NotificationBannerSimple
                notification={notification}
                showCloseButton={true}
              />
            </Box>
          ))}

          {/* Read notifications if requested */}
          {includeRead && readNotifications.length > 0 && (
            <>
              {unreadNotifications.length > 0 && (
                <Box p={3} bg="gray.50" _dark={{ bg: 'gray.800' }}>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    Read notifications
                  </Text>
                </Box>
              )}
              {readNotifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={3}
                  borderBottomWidth={1}
                  opacity={0.7}
                >
                  <NotificationBannerSimple
                    notification={notification}
                    showCloseButton={false}
                  />
                </Box>
              ))}
            </>
          )}
        </VStack>
      </Box>

      {/* Footer */}
      {!includeRead && readNotifications.length > 0 && (
        <Box p={3} borderTopWidth={1} textAlign="center">
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            {readNotifications.length} read notification{readNotifications.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
};