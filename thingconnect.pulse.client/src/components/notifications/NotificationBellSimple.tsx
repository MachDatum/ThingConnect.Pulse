import React from 'react';
import {
  Box,
  IconButton,
  useDisclosure,
  Popover,
  Portal,
} from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import { NotificationCenterSimple } from './NotificationCenterSimple';
import { useNotificationStats } from '@/hooks/useNotifications';

interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  colorPalette?: string;
  showPopover?: boolean;
}

export const NotificationBellSimple: React.FC<NotificationBellProps> = ({
  size = 'md',
  variant = 'ghost',
  colorPalette = 'gray',
  showPopover = true,
}) => {
  const { data: stats } = useNotificationStats();
  const { open: isOpen, onOpen, onClose } = useDisclosure();

  const unreadCount = stats?.unreadNotifications || 0;
  const hasUnread = unreadCount > 0;

  if (!showPopover) {
    return (
      <IconButton
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        size={size}
        variant={variant}
        colorPalette={hasUnread ? 'blue' : colorPalette}
        _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
        position="relative"
      >
        <Bell size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />

        {/* Notification badge */}
        {hasUnread && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            bg="red.500"
            color="white"
            borderRadius="full"
            minW={unreadCount > 99 ? '24px' : '20px'}
            h={unreadCount > 99 ? '24px' : '20px'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={unreadCount > 99 ? '10px' : '12px'}
            fontWeight="bold"
            borderWidth={2}
            borderColor="white"
            _dark={{ borderColor: 'gray.800' }}
            zIndex={1}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Box>
        )}
      </IconButton>
    );
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(details) => details.open ? onOpen() : onClose()}
      positioning={{ placement: "bottom-end" }}
    >
      <Popover.Trigger asChild>
        <IconButton
          aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
          size={size}
          variant={variant}
          colorPalette={hasUnread ? 'blue' : colorPalette}
          _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
          position="relative"
        >
          <Bell size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />

          {/* Notification badge */}
          {hasUnread && (
            <Box
              position="absolute"
              top="-2px"
              right="-2px"
              bg="red.500"
              color="white"
              borderRadius="full"
              minW={unreadCount > 99 ? '24px' : '20px'}
              h={unreadCount > 99 ? '24px' : '20px'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={unreadCount > 99 ? '10px' : '12px'}
              fontWeight="bold"
              borderWidth={2}
              borderColor="white"
              _dark={{ borderColor: 'gray.800' }}
              zIndex={1}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Box>
          )}
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            maxW="400px"
            w="400px"
            p={0}
            borderRadius="md"
            shadow="xl"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            _dark={{ bg: "gray.800", borderColor: "gray.600" }}
          >
            <NotificationCenterSimple
              includeRead={false}
              maxHeight="400px"
              showRefreshButton={true}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};