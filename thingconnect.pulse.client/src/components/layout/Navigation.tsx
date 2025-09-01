import { Box, VStack, Text, Icon, Image, HStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import thingConnectIcon from '@/assets/thingconnect-icon.svg';
import { Home, Clock, Wrench, Settings, Info } from '@/icons';

interface NavigationProps {
  onItemClick?: () => void;
}

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Config', path: '/config', icon: Wrench },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'About', path: '/about', icon: Info },
];

export function Navigation({ onItemClick }: NavigationProps) {
  const location = useLocation();

  const isActiveRoute = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

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
          const isActive = isActiveRoute(item.path);
          return (
            <RouterLink key={item.path} to={item.path} onClick={onItemClick}>
              <HStack
                px={3}
                py={2}
                borderRadius='md'
                bg={isActive ? 'blue.50' : 'transparent'}
                color={isActive ? 'blue.700' : 'gray.700'}
                _hover={{ bg: isActive ? 'blue.100' : 'gray.100' }}
                _dark={{
                  bg: isActive ? 'blue.900' : 'transparent',
                  color: isActive ? 'blue.200' : 'gray.200',
                  _hover: { bg: isActive ? 'blue.800' : 'gray.700' },
                }}
                borderLeft='3px solid'
                borderLeftColor={isActive ? 'blue.500' : 'transparent'}
              >
                <Icon as={item.icon} boxSize={4} />
                <Text fontSize='sm' fontWeight={isActive ? 'semibold' : 'normal'}>
                  {item.label}
                </Text>
              </HStack>
            </RouterLink>
          );
        })}
      </VStack>
      <Box
        p={3}
        borderTop='1px'
        borderColor='gray.200'
        _dark={{ borderColor: 'gray.700' }}
        data-testid='system-status'
      >
        <HStack gap={2}>
          <Icon as={Activity} boxSize={4} color='green.500' />
          <Text fontSize='xs' color='gray.600' _dark={{ color: 'gray.400' }}>
            System Online
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
