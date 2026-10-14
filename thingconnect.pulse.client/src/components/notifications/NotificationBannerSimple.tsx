import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@chakra-ui/react';
import { CloseButton } from '@/components/ui/close-button';
import { Info, AlertTriangle, Download, Settings } from 'lucide-react';
import type { Notification } from '@/api/types';
import { useMarkNotificationRead, useMarkNotificationShown } from '@/hooks/useNotifications';

interface NotificationBannerProps {
  notification: Notification;
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export const NotificationBannerSimple: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  showCloseButton = true,
}) => {
  const markReadMutation = useMarkNotificationRead();
  const { mutate: markShown } = useMarkNotificationShown();
  const markedShownIdRef = React.useRef<string | null>(null);

  // Depend on the stable `mutate` (not the mutation object, which changes on every
  // state transition) and mark each notification only once, so the mark-shown →
  // invalidate → refetch cycle can't loop before the refetched isShown arrives.
  React.useEffect(() => {
    if (!notification.isShown && markedShownIdRef.current !== notification.id) {
      markedShownIdRef.current = notification.id;
      markShown(notification.id);
    }
  }, [notification.id, notification.isShown, markShown]);

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

  const getStatus = () => {
    switch (notification.type) {
      case 'warning':
        return 'warning';
      case 'release':
        return 'success';
      case 'maintenance':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'release':
        return <Download size={20} />;
      case 'maintenance':
        return <Settings size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <Alert
      status={getStatus()}
      title={notification.title}
      icon={getIcon()}
      endElement={
        showCloseButton ? (
          <CloseButton size="sm" onClick={handleDismiss} />
        ) : undefined
      }
    >
      {notification.message}
      {notification.actionUrl && (
        <div style={{ marginTop: '8px' }}>
          <Button size="sm" variant="outline" onClick={handleActionClick}>
            {notification.actionText || 'Learn More'}
          </Button>
        </div>
      )}
    </Alert>
  );
};