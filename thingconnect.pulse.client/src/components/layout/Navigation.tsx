import { Box, VStack, Text, Icon, Image, HStack, Badge, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Wifi, Activity, LogOut } from 'lucide-react';
import thingConnectIcon from '@/assets/thingconnect-icon.svg';
import { Clock, Wrench, Settings, Info, Dashboard, Help } from '@/icons';
import { useAuth } from '@/features/auth/context/AuthContext';
interface NavigationProps {
  onItemClick?: () => void;
}

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Dashboard },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Config', path: '/config', icon: Wrench },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: 'https://docs.thingconnect.io/pulse/', icon: Help, external: true },
  { label: 'About', path: '/about', icon: Info },
];

export function Navigation({ onItemClick }: NavigationProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const isActiveRoute = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to login will be handled by the auth context
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Box h='100%' display='flex' flexDirection='column' data-testid='navigation'>
      <Box
        p={4}
        borderBottom='1px'
        borderColor='gray.200'
        _dark={{ borderColor: 'gray.700' }}
        data-testid='brand-section'
      >
        <HStack gap={3}>
          <Image
            data-testid='thingconnect-icon'
            src={thingConnectIcon}
            alt='ThingConnect'
            boxSize='32px'
          />
          <Box>
            <Text
              fontSize='sm'
              fontWeight='bold'
              color='blue.600'
              _dark={{ color: 'blue.400' }}
              data-testid='brand-name'
            >
              ThingConnect
            </Text>
            <Text
              fontSize='xs'
              color='gray.600'
              _dark={{ color: 'gray.400' }}
              data-testid='brand-subtitle'
            >
              Pulse Monitor
            </Text>
          </Box>
        </HStack>
      </Box>
      <VStack gap={1} p={2} flex='1' align='stretch' data-testid='navigation-items'>
        {navigationItems.map(item => {
          const isActive = !item.external && isActiveRoute(item.path);
          const ItemContent = (
            <HStack
              px={2}
              py={1}
              borderRadius='md'
              color={isActive ? 'blue.600' : 'gray.600'}
              bg={isActive ? 'whiteAlpha.950' : 'transparent'}
              border={isActive ? '1px solid' : undefined}
              borderColor={isActive ? 'border' : undefined}
              _hover={
                isActive
                  ? undefined
                  : {
                      bg: 'blackAlpha.50',
                      _dark: { bg: 'gray.700' },
                    }
              }
              _dark={{
                color: isActive ? 'blue.200' : 'gray.200',
                bg: isActive ? 'blackAlpha.200' : undefined,
                border: isActive ? '1px solid rgba(255,255,255,0.1)' : undefined,
              }}
            >
              <Icon as={item.icon} boxSize={4} />
              <Text fontSize='sm' fontWeight={'semibold'}>
                {item.label}
              </Text>
            </HStack>
          );

          return item.external ? (
            <Box as='a' key={item.path} href={item.path} target='_blank' rel='noopener noreferrer' onClick={onItemClick}>
              {ItemContent}
            </Box>
          ) : (
            <RouterLink key={item.path} to={item.path} onClick={onItemClick}>
              {ItemContent}
            </RouterLink>
          );
        })}
      </VStack>
      <Box p={3} borderTop='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
        <VStack align='stretch' gap={3}>
          <VStack align='stretch' gap={2}>
            <HStack gap={2} display={{ base: 'none', md: 'flex' }} data-testid='connection-status'>
              <Wifi size={16} aria-label='Connection status' />
              <Badge colorPalette='green' variant='solid' size='sm'>
                Connected
              </Badge>
              <Text
                data-testid='last-refresh-time'
                fontSize='xs'
                color='gray.500'
                _dark={{ color: 'gray.400' }}
                display={{ base: 'none', md: 'block' }}
              >
                Updated 2s ago
              </Text>
            </HStack>
            <HStack gap={2}>
              <Icon
                as={Activity}
                boxSize={4}
                color='green.500'
                aria-label='System status'
                data-testid='system-status'
              />
              <Text fontSize='xs' color='gray.600' _dark={{ color: 'gray.400' }}>
                System Online
              </Text>
            </HStack>
          </VStack>
          
          <Button
            onClick={handleLogout}
            size='sm'
            variant='ghost'
            colorScheme='gray'
            justifyContent='flex-start'
            leftIcon={<LogOut size={16} />}
            w='full'
            _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
            data-testid='logout-button'
          >
            <Text fontSize='sm' fontWeight='semibold'>
              Logout
            </Text>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
