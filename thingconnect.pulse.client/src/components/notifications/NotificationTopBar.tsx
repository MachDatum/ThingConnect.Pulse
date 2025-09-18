import React from 'react';
import { Box, HStack, Text, Button, CloseButton } from '@chakra-ui/react';
import { Info, AlertTriangle, Download, Settings } from 'lucide-react';
import type { Notification } from '@/api/types';
import { useMarkNotificationRead } from '@/hooks/useNotifications';

interface NotificationTopBarProps {
  notification: Notification;
  onDismiss?: () => void;
}

const getBackgroundColor = (type: Notification['type'], priority: Notification['priority']) => {
  if (priority === 'critical') return 'red.500';
  if (priority === 'high') return 'orange.500';

  switch (type) {
    case 'warning':
      return 'yellow.500';
    case 'release':
      return 'green.500';
    case 'maintenance':
      return 'blue.500';
    default:
      return 'blue.500';
  }
};

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={18} />;
    case 'release':
      return <Download size={18} />;
    case 'maintenance':
      return <Settings size={18} />;
    default:
      return <Info size={18} />;
  }
};

export const NotificationTopBar: React.FC<NotificationTopBarProps> = ({
  notification,
  onDismiss,
}) => {
  const markReadMutation = useMarkNotificationRead();

  const handleDismiss = () => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    onDismiss?.();
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
    }

    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  const bgColor = getBackgroundColor(notification.type, notification.priority);
  const icon = getIcon(notification.type);

  return (
    <Box
      bg={bgColor}
      color="white"
      py={3}
      px={4}
      position="relative"
      zIndex={1000}
    >
      <HStack justifyContent="space-between" maxW="7xl" mx="auto">
        <HStack gap={3} flex={1}>
          {icon}
          <Text fontWeight="medium" fontSize="sm">
            {notification.title}
          </Text>
          {notification.message && (
            <>
              <Text fontSize="sm">—</Text>
              <Text fontSize="sm">{notification.message}</Text>
            </>
          )}
        </HStack>

        <HStack gap={2}>
          {notification.actionUrl && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="whiteAlpha"
              onClick={handleActionClick}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              {notification.actionText || 'Learn More'}
            </Button>
          )}
          <CloseButton
            size="sm"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </HStack>
      </HStack>
    </Box>
  );
};