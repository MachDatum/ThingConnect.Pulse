import { Box, VStack, Text, Icon, Image, HStack, Badge, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Wifi, Activity, LogOut, Users } from 'lucide-react';
import thingConnectIcon from '@/assets/ThingConnectPulseLogo.svg';
import { Clock, Wrench, Settings, Info, Dashboard, Help } from '@/icons';
import { useAuth } from '@/features/auth/context/AuthContext';
interface NavigationProps {
  onItemClick?: () => void;
}

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Dashboard },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Configuration', path: '/configuration', icon: Wrench, adminOnly: true },
  { label: 'User Management', path: '/users', icon: Users, adminOnly: true },
  { label: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
  { label: 'Help', path: 'https://docs.thingconnect.io/pulse/', icon: Help, external: true },
  { label: 'About', path: '/about', icon: Info },
];

export function Navigation({ onItemClick }: NavigationProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isAdmin = user?.role === 'Administrator';

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
        m={3}
        borderBottom='1px'
        borderColor='gray.200'
        _dark={{ borderColor: 'gray.700' }}
        data-testid='brand-section'
      >
        <Image
          data-testid='thingconnect-icon'
          src={thingConnectIcon}
          alt='ThingConnect'
          w={44}
          h='auto'
        />
      </Box>
      <VStack gap={2} p={4} flex='1' align='stretch' data-testid='navigation-items'>
        {navigationItems
          .filter(item => !item.adminOnly || isAdmin)
          .map(item => {
          const isActive = !item.external && isActiveRoute(item.path);
          const ItemContent = (
            <HStack
              px={3}
              py={2.5}
              borderRadius='lg'
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
              <Text fontSize='sm' fontWeight='medium' letterSpacing='0.025em' lineHeight='1.2'>
                {item.label}
              </Text>
            </HStack>
          );

          return item.external ? (
            <Box as='a' key={item.path} asChild onClick={onItemClick}>
              <a href={item.path} target='_blank' rel='noopener noreferrer'>
                {ItemContent}
              </a>
            </Box>
          ) : (
            <RouterLink key={item.path} to={item.path} onClick={onItemClick}>
              {ItemContent}
            </RouterLink>
          );
        })}
      </VStack>
      <Box p={4} borderTop='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
        <VStack align='stretch' gap={4}>
          <VStack align='stretch' gap={3}>
            <HStack gap={2} display={{ base: 'none', md: 'flex' }} data-testid='connection-status'>
              <Wifi size={16} aria-label='Connection status' />
              <Badge colorPalette='green' variant='solid' size='sm'>
                Connected
              </Badge>
              <Text
                data-testid='last-refresh-time'
                fontSize='xs'
                fontWeight='medium'
                letterSpacing='0.025em'
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
              <Text
                fontSize='xs'
                fontWeight='medium'
                letterSpacing='0.025em'
                color='gray.600'
                _dark={{ color: 'gray.400' }}
              >
                System Online
              </Text>
            </HStack>
          </VStack>
          <Button
            onClick={handleLogout}
            size='sm'
            variant='ghost'
            colorPalette='gray'
            justifyContent='flex-start'
            w='full'
            _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
            data-testid='logout-button'
            px='0'
          >
            <LogOut size={16} />
            <Text fontSize='sm' fontWeight='medium' letterSpacing='0.025em' lineHeight='1.2'>
              Logout
            </Text>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
