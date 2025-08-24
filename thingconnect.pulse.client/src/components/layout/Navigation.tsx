import { Box, VStack, Link, Icon, Text, Image, HStack } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { 
  Home, 
  Clock, 
  Settings, 
  Wrench,
  Activity
} from 'lucide-react'
import thingConnectIcon from '@/assets/thingconnect-icon.svg'

interface NavigationProps {
  onItemClick?: () => void
}

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: Home,
    description: 'Live status overview'
  },
  {
    label: 'History',
    path: '/history',
    icon: Clock,
    description: 'Historical data & trends'
  },
  {
    label: 'Config',
    path: '/config',
    icon: Wrench,
    description: 'Endpoint configuration'
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Application settings'
  }
]

export function Navigation({ onItemClick }: NavigationProps) {
  const location = useLocation()

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" data-testid="navigation">
      {/* Brand section */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }} data-testid="brand-section">
        <HStack gap={3}>
          <Image 
            data-testid="thingconnect-icon"
            src={thingConnectIcon}
            alt="ThingConnect"
            boxSize="32px"
          />
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="blue.600" _dark={{ color: 'blue.400' }} data-testid="brand-name">
              ThingConnect
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} data-testid="brand-subtitle">
              Pulse Monitor
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Navigation items */}
      <VStack gap={1} p={2} flex="1" align="stretch" data-testid="navigation-items">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.path)
          
          return (
            <Link
              key={item.path}
              asChild
              onClick={onItemClick}
              textDecoration="none"
              _hover={{ textDecoration: 'none' }}
            >
              <RouterLink to={item.path}>
              <Box
                data-testid={`nav-item-${item.label.toLowerCase()}`}
                p={3}
                borderRadius="md"
                bg={isActive ? 'blue.50' : 'transparent'}
                color={isActive ? 'blue.700' : 'gray.700'}
                _hover={{
                  bg: isActive ? 'blue.100' : 'gray.100'
                }}
                _dark={{
                  bg: isActive ? 'blue.900' : 'transparent',
                  color: isActive ? 'blue.200' : 'gray.200',
                  _hover: {
                    bg: isActive ? 'blue.800' : 'gray.700'
                  }
                }}
                borderLeft={isActive ? '3px solid' : '3px solid transparent'}
                borderLeftColor={isActive ? 'blue.500' : 'transparent'}
                aria-label={`Navigate to ${item.label}`}
              >
                <HStack gap={3}>
                  <Icon as={item.icon} boxSize={5} aria-hidden="true" />
                  <Box>
                    <Text fontSize="sm" fontWeight={isActive ? 'semibold' : 'normal'}>
                      {item.label}
                    </Text>
                    <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                      {item.description}
                    </Text>
                  </Box>
                </HStack>
              </Box>
              </RouterLink>
            </Link>
          )
        })}
      </VStack>

      {/* Status indicator at bottom */}
      <Box p={3} borderTop="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }} data-testid="system-status">
        <HStack gap={2}>
          <Icon as={Activity} boxSize={4} color="green.500" aria-label="System status" />
          <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
            System Online
          </Text>
        </HStack>
      </Box>
    </Box>
  )
}