import { HStack, IconButton } from '@chakra-ui/react';
import { Moon, Sun, HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useColorMode } from '../ui/color-mode';
import { Tooltip } from '../ui/tooltip';
import { NotificationBellSimple } from '@/components/notifications/NotificationBellSimple';

// Route-to-help URL mapping
const ROUTE_HELP_URLS: Record<string, string> = {
  '/': 'https://docs.thingconnect.io/pulse/live-board-and-history',
  '/configuration': 'https://docs.thingconnect.io/pulse/yaml-configuration',
  '/history': 'https://docs.thingconnect.io/pulse/live-board-and-history#historical-data-analysis',
  // '/settings': 'https://docs.thingconnect.io/pulse/user-guide/settings',
  // '/about': 'https://docs.thingconnect.io/pulse/about',
};

export function FloatingActions() {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();

  const helpUrl = ROUTE_HELP_URLS[location.pathname];

  const handleHelpClick = () => {
    if (helpUrl) {
      window.open(helpUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <HStack
      position='fixed'
      top='16px'
      right='16px'
      zIndex={1100}
      gap={1}
      data-testid='floating-actions'
    >
      {/* Notification Bell */}
      <NotificationBellSimple
        size='sm'
        showPopover={true}
        variant='ghost'
        colorPalette='gray'
      />

      {/* Help Button - only show if help URL exists for current route */}
      {helpUrl && (
        <Tooltip content='View Help'>
          <IconButton
            data-testid='help-button'
            aria-label='View Help'
            variant='ghost'
            size='sm'
            onClick={handleHelpClick}
            _hover={{ bg: 'blue.50', _dark: { bg: 'blue.900' } }}
          >
            <HelpCircle size={18} />
          </IconButton>
        </Tooltip>
      )}

      {/* Theme Toggle */}
      <Tooltip content='Toggle color mode'>
        <IconButton
          data-testid='theme-toggle'
          aria-label='Toggle color mode'
          variant='ghost'
          size='sm'
          onClick={toggleColorMode}
          _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
        >
          {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
      </Tooltip>
    </HStack>
  );
}
