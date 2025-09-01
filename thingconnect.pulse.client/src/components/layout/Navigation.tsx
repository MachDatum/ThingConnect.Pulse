import {
  Box,
  VStack,
  Text,
  Icon,
  Image,
  HStack,
  Badge,
  Separator,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { History, Wifi } from 'lucide-react';
import thingConnectIcon from '@/assets/thingconnect-icon.svg';
import { Clock, Wrench, Settings, Info, Dashboard, Moon, Sun } from '@/icons';
import { useColorMode } from '../ui/color-mode';
interface NavigationProps {
  onItemClick?: () => void;
}

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Dashboard },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Config', path: '/config', icon: Wrench },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'About', path: '/about', icon: Info },
];

export function Navigation({ onItemClick }: NavigationProps) {
  const { colorMode, toggleColorMode } = useColorMode();
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
        <VStack align='stretch' gap={2}>
          <HStack display={{ base: 'none', md: 'flex' }}>
            <Wifi size={16} aria-label='Connection status' />
            <Badge bg='gray.200' size='sm' _dark={{ color: 'gray.800' }}>
              Connected
            </Badge>
          </HStack>
          <HStack gap={2}>
            <Icon as={History} boxSize={4} />
            <Text fontSize='xs' _dark={{ color: 'gray.400' }}>
              Updated 2s ago
            </Text>
          </HStack>
          <Separator _dark={{ borderColor: 'gray.600' }} />
          <HStack justify='space-between'>
            <Text fontSize='sm' color='gray.700' _dark={{ color: 'gray.400' }}>
              {colorMode === 'light' ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <IconButton
              data-testid='theme-toggle'
              aria-label='Toggle color mode'
              variant='ghost'
              size='sm'
              onClick={toggleColorMode}
              color={'gray.700'}
              _dark={{ color: 'gray.300' }}
            >
              {colorMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
