import { Box, VStack, Text, Icon, Image, HStack, Badge, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Wifi, Activity, LogOut } from 'lucide-react';
import thingConnectIcon from '@/assets/thingconnect-pulse-logo.svg';
import { Clock, Wrench, Settings, Info, Dashboard, Help, Users } from '@/icons';
import { useAuth } from '@/features/auth/context/AuthContext';
import { testId } from '@/utils/testUtils';
import { ariaUtils, ARIA_ROLES } from '@/utils/ariaUtils';
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
    <nav
      role={ARIA_ROLES.NAVIGATION}
      aria-label="Main navigation"
      data-testid={testId.nav('main')}
    >
      <Box h='100%' display='flex' flexDirection='column'>
        <header
          role={ARIA_ROLES.BANNER}
          data-testid={testId.custom(['brand', 'section'])}
        >
          <Box
            p={6}
            borderBottom='1px'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <Image
              data-testid={testId.custom(['brand', 'logo'])}
              src={thingConnectIcon}
              alt='ThingConnect Pulse - Network Monitoring'
              w={44}
              h='auto'
            />
          </Box>
        </header>

        <Box
          as="section"
          flex='1'
          role={ARIA_ROLES.NAVIGATION}
          aria-label="Navigation menu"
          data-testid={testId.custom(['navigation', 'menu'])}
        >
          <ul role={ARIA_ROLES.LIST} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <VStack gap={2} p={4} align='stretch'>
              {navigationItems
                .filter(item => !item.adminOnly || isAdmin)
                .map(item => {
                  const isActive = !item.external && isActiveRoute(item.path);
                  const linkId = item.label.toLowerCase().replace(/\s+/g, '-');

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
                      <Icon as={item.icon} boxSize={4} aria-hidden="true" />
                      <Text fontSize='sm' fontWeight='medium' letterSpacing='0.025em' lineHeight='1.2'>
                        {item.label}
                      </Text>
                    </HStack>
                  );

                  return (
                    <li key={item.path} role={ARIA_ROLES.LISTITEM}>
                      {item.external ? (
                        <a
                          href={item.path}
                          target='_blank'
                          rel='noopener noreferrer'
                          onClick={onItemClick}
                          data-testid={testId.navLink(linkId)}
                          aria-label={`${item.label} (opens in new tab)`}
                          style={{ textDecoration: 'none' }}
                        >
                          {ItemContent}
                        </a>
                      ) : (
                        <RouterLink
                          to={item.path}
                          onClick={onItemClick}
                          data-testid={testId.navLink(linkId)}
                          {...ariaUtils.navItemProps(isActive, item.label)}
                        >
                          {ItemContent}
                        </RouterLink>
                      )}
                    </li>
                  );
                })}
            </VStack>
          </ul>
        </Box>
        <footer
          role={ARIA_ROLES.CONTENTINFO}
          data-testid={testId.custom(['navigation', 'footer'])}
        >
          <Box p={4} borderTop='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
            <VStack align='stretch' gap={4}>
              <section
                aria-label="System status"
                data-testid={testId.status('system-info')}
              >
                <VStack align='stretch' gap={3}>
                  <HStack
                    gap={2}
                    display={{ base: 'none', md: 'flex' }}
                    data-testid={testId.status('connection')}
                    role={ARIA_ROLES.STATUS}
                    aria-live="polite"
                  >
                    <Wifi size={16} aria-hidden="true" />
                    <Badge
                      colorPalette='green'
                      variant='solid'
                      size='sm'
                      role={ARIA_ROLES.STATUS}
                    >
                      Connected
                    </Badge>
                    <Text
                      data-testid={testId.custom(['last', 'refresh', 'time'])}
                      fontSize='xs'
                      fontWeight='medium'
                      letterSpacing='0.025em'
                      color='gray.500'
                      _dark={{ color: 'gray.400' }}
                      display={{ base: 'none', md: 'block' }}
                      aria-label="Last refresh time"
                    >
                      Updated 2s ago
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Icon
                      as={Activity}
                      boxSize={4}
                      color='green.500'
                      aria-hidden="true"
                    />
                    <Text
                      fontSize='xs'
                      fontWeight='medium'
                      letterSpacing='0.025em'
                      color='gray.600'
                      _dark={{ color: 'gray.400' }}
                      data-testid={testId.status('system')}
                      role={ARIA_ROLES.STATUS}
                      aria-live="polite"
                    >
                      System Online
                    </Text>
                  </HStack>
                </VStack>
              </section>

              <Button
                onClick={handleLogout}
                size='sm'
                variant='ghost'
                colorPalette='gray'
                justifyContent='flex-start'
                w='full'
                _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
                data-testid={testId.button('logout')}
                px='0'
                aria-label="Sign out of application"
              >
                <LogOut size={16} aria-hidden="true" />
                <Text fontSize='sm' fontWeight='medium' letterSpacing='0.025em' lineHeight='1.2'>
                  Logout
                </Text>
              </Button>
            </VStack>
          </Box>
        </footer>
      </Box>
    </nav>
  );
}
