import { 
  Box, 
  Flex, 
  Image, 
  Text, 
  HStack, 
  IconButton, 
  useBreakpointValue,
  Badge,
  Spacer
} from '@chakra-ui/react'
import { Menu, Wifi, Moon, Sun } from 'lucide-react'
import { useColorMode } from '@/components/ui/color-mode'
import thingConnectLogo from '@/assets/thingconnect-logo.svg'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const showMenuButton = useBreakpointValue({ base: true, md: false })
  const logoHeight = useBreakpointValue({ base: '28px', md: '32px' })

  return (
    <Box
      data-testid="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={4}
      h="60px"
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.700'
      }}
    >
      <Flex align="center" h="100%">
        {/* Mobile menu button */}
        {showMenuButton && (
          <IconButton
            data-testid="mobile-menu-button"
            aria-label="Toggle navigation"
            variant="ghost"
            size="sm"
            mr={3}
            onClick={onMenuClick}
          >
            <Menu />
          </IconButton>
        )}

        {/* Logo and title */}
        <HStack gap={3} flex="1" data-testid="logo-section">
          <Image 
            data-testid="thingconnect-logo"
            src={thingConnectLogo}
            alt="ThingConnect"
            h={logoHeight}
            objectFit="contain"
          />
          <Box>
            <Text 
              data-testid="app-title"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              color="blue.600"
              _dark={{ color: 'blue.400' }}
              lineHeight="1"
            >
              Pulse Network Monitor
            </Text>
            <Text 
              data-testid="app-description"
              fontSize="xs" 
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              display={{ base: 'none', md: 'block' }}
            >
              Real-time network availability monitoring
            </Text>
          </Box>
        </HStack>

        <Spacer />

        {/* Status and controls */}
        <HStack gap={3} data-testid="header-controls">
          {/* Connection status */}
          <HStack gap={2} display={{ base: 'none', md: 'flex' }} data-testid="connection-status">
            <Wifi size={16} aria-label="Connection status" />
            <Badge colorPalette="green" variant="solid" size="sm">
              Connected
            </Badge>
          </HStack>

          {/* Last refresh time */}
          <Text 
            data-testid="last-refresh-time"
            fontSize="xs" 
            color="gray.500"
            _dark={{ color: 'gray.400' }}
            display={{ base: 'none', md: 'block' }}
          >
            Updated 2s ago
          </Text>

          {/* Theme toggle */}
          <IconButton
            data-testid="theme-toggle"
            aria-label="Toggle color mode"
            variant="ghost"
            size="sm"
            onClick={toggleColorMode}
          >
            {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  )
}