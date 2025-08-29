import type { Meta, StoryObj } from '@storybook/react'
import { Box, Text, IconButton } from '@chakra-ui/react'
import * as Sidebar from './sidebar'
import {
  LuActivity,
  LuSettings,
  LuBell,
  LuUsers,
  LuShield,
  LuUser,
} from 'react-icons/lu'

const meta: Meta<typeof Sidebar.Root> = {
  title: 'Components/Sidebar',
  component: Sidebar.Root,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A responsive sidebar component with collapsible sections, rail mode, and mobile overlay support.',
      },
    },
  },
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: 'Whether the sidebar is expanded by default',
    },
  },
}

export default meta
type Story = StoryObj<typeof Sidebar.Root>

// Basic sidebar example
export const Default: Story = {
  args: {
    defaultExpanded: true,
  },
  render: (args) => (
    <Box minH="100vh" bg="bg">
      <Sidebar.Root {...args}>
        <Sidebar.Container>
          <Sidebar.Header>
            <Box display="flex" alignItems="center" gap="2">
              <Box
                width="32px"
                height="32px"
                bg="blue.500"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold" fontSize="sm">
                  TC
                </Text>
              </Box>
              <Text fontWeight="semibold" fontSize="lg">
                ThingConnect
              </Text>
            </Box>
          </Sidebar.Header>

          <Sidebar.Body>
            <Sidebar.Section title="Main">
              <Sidebar.Item
                id="dashboard"
                icon={<LuActivity />}
                active
              >
                Dashboard
              </Sidebar.Item>

              <Sidebar.Group id="monitoring">
                <Sidebar.GroupTrigger
                  groupId="monitoring"
                  icon={<LuActivity />}
                  badge="12"
                >
                  Monitoring
                </Sidebar.GroupTrigger>
                <Sidebar.GroupContent groupId="monitoring">
                  <Sidebar.Item id="devices" icon={<LuActivity />}>
                    Devices
                  </Sidebar.Item>
                  <Sidebar.Item id="services" icon={<LuActivity />}>
                    Services
                  </Sidebar.Item>
                  <Sidebar.Item id="health-checks" icon={<LuActivity />}>
                    Health Checks
                  </Sidebar.Item>
                </Sidebar.GroupContent>
              </Sidebar.Group>

              <Sidebar.Item
                id="alerts"
                icon={<LuBell />}
                badge="5"
              >
                Alerts
              </Sidebar.Item>
            </Sidebar.Section>

            <Sidebar.Section title="Analytics">
              <Sidebar.Group id="reports">
                <Sidebar.GroupTrigger
                  groupId="reports"
                  icon={<LuActivity />}
                >
                  Reports
                </Sidebar.GroupTrigger>
                <Sidebar.GroupContent groupId="reports">
                  <Sidebar.Item id="availability" icon={<LuActivity />}>
                    Availability
                  </Sidebar.Item>
                  <Sidebar.Item id="performance" icon={<LuActivity />}>
                    Performance
                  </Sidebar.Item>
                </Sidebar.GroupContent>
              </Sidebar.Group>

              <Sidebar.Item id="insights" icon={<LuActivity />}>
                Insights
              </Sidebar.Item>
            </Sidebar.Section>

            <Sidebar.Section title="Configuration">
              <Sidebar.Item id="settings" icon={<LuSettings />}>
                Settings
              </Sidebar.Item>

              <Sidebar.Item id="integrations" icon={<LuShield />}>
                Integrations
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Body>

          <Sidebar.Footer>
            <Sidebar.Item id="help" icon={<LuSettings />}>
              Help & Support
            </Sidebar.Item>
            
            <Box
              p="3"
              bg="bg.subtle"
              borderRadius="md"
              border="1px solid"
              borderColor="border.subtle"
              mt="2"
            >
              <Box display="flex" alignItems="center" gap="3">
                <Box
                  width="32px"
                  height="32px"
                  bg="gray.200"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <LuUser size={16} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium">
                    John Doe
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    john@company.com
                  </Text>
                </Box>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="User menu"
                >
                  <LuSettings />
                </IconButton>
              </Box>
            </Box>
          </Sidebar.Footer>
        </Sidebar.Container>

        <Sidebar.Overlay />
      </Sidebar.Root>

      {/* Main content area */}
      <Box ml="240px" p="6">
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          Dashboard
        </Text>
        <Text color="fg.muted" mb="6">
          This is the main content area. The sidebar will automatically adjust for mobile and collapsed states.
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Try collapsing the sidebar using the toggle button in the header.
        </Text>
      </Box>
    </Box>
  ),
}

// Collapsed rail mode
export const Collapsed: Story = {
  args: {
    defaultExpanded: false,
  },
  render: (args) => (
    <Box minH="100vh" bg="bg">
      <Sidebar.Root {...args}>
        <Sidebar.Container>
          <Sidebar.Header>
            <Box display="flex" alignItems="center" gap="2">
              <Box
                width="32px"
                height="32px"
                bg="blue.500"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold" fontSize="sm">
                  TC
                </Text>
              </Box>
            </Box>
          </Sidebar.Header>

          <Sidebar.Body>
            <Sidebar.Section>
              <Sidebar.Item
                id="dashboard"
                icon={<LuActivity />}
                active
              >
                Dashboard
              </Sidebar.Item>

              <Sidebar.Item
                id="monitoring"
                icon={<LuActivity />}
              >
                Monitoring
              </Sidebar.Item>

              <Sidebar.Item
                id="alerts"
                icon={<LuBell />}
              >
                Alerts
              </Sidebar.Item>

              <Sidebar.Item id="reports" icon={<LuActivity />}>
                Reports
              </Sidebar.Item>

              <Sidebar.Item id="settings" icon={<LuSettings />}>
                Settings
              </Sidebar.Item>

              <Sidebar.Item id="users" icon={<LuUsers />}>
                Users
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Body>

          <Sidebar.Footer>
            <Sidebar.Item id="help" icon={<LuSettings />}>
              Help
            </Sidebar.Item>
            
            <Box
              p="2"
              display="flex"
              justifyContent="center"
            >
              <Box
                width="32px"
                height="32px"
                bg="gray.200"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <LuUser size={16} />
              </Box>
            </Box>
          </Sidebar.Footer>
        </Sidebar.Container>

        <Sidebar.Overlay />
      </Sidebar.Root>

      {/* Main content area */}
      <Box ml="64px" p="6">
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          Rail Mode
        </Text>
        <Text color="fg.muted" mb="6">
          In collapsed mode, the sidebar shows only icons with tooltips on hover.
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Hover over the sidebar icons to see the tooltips with full labels.
        </Text>
      </Box>
    </Box>
  ),
}

// Simple navigation without groups
export const SimpleNavigation: Story = {
  args: {
    defaultExpanded: true,
  },
  render: (args) => (
    <Box minH="100vh" bg="bg">
      <Sidebar.Root {...args}>
        <Sidebar.Container>
          <Sidebar.Header>
            <Box display="flex" alignItems="center" gap="2">
              <Text fontWeight="bold" fontSize="xl">
                Simple Nav
              </Text>
            </Box>
          </Sidebar.Header>

          <Sidebar.Body>
            <Sidebar.Section>
              <Sidebar.Item
                id="home"
                icon={<LuActivity />}
                active
              >
                Home
              </Sidebar.Item>

              <Sidebar.Item id="analytics" icon={<LuActivity />}>
                Analytics
              </Sidebar.Item>

              <Sidebar.Item
                id="notifications"
                icon={<LuBell />}
                badge="3"
              >
                Notifications
              </Sidebar.Item>

              <Sidebar.Item id="settings" icon={<LuSettings />}>
                Settings
              </Sidebar.Item>

              <Sidebar.Item id="disabled" icon={<LuShield />} disabled>
                Disabled Item
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Body>
        </Sidebar.Container>

        <Sidebar.Overlay />
      </Sidebar.Root>

      {/* Main content area */}
      <Box ml="240px" p="6">
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          Simple Navigation
        </Text>
        <Text color="fg.muted">
          A simple sidebar without collapsible groups - just flat navigation items.
        </Text>
      </Box>
    </Box>
  ),
}

// Mobile responsive demo (for smaller viewports)
export const MobileDemo: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <Box minH="100vh" bg="bg">
      <Sidebar.Root {...args}>
        <Sidebar.Container>
          <Sidebar.Header>
            <Box display="flex" alignItems="center" gap="2">
              <Text fontWeight="bold" fontSize="lg">
                Mobile Menu
              </Text>
            </Box>
          </Sidebar.Header>

          <Sidebar.Body>
            <Sidebar.Section>
              <Sidebar.Item id="home" icon={<LuActivity />} active>
                Home
              </Sidebar.Item>
              <Sidebar.Item id="analytics" icon={<LuActivity />}>
                Analytics
              </Sidebar.Item>
              <Sidebar.Item id="notifications" icon={<LuBell />} badge="3">
                Notifications
              </Sidebar.Item>
              <Sidebar.Item id="settings" icon={<LuSettings />}>
                Settings
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Body>
        </Sidebar.Container>

        <Sidebar.Overlay />
      </Sidebar.Root>

      {/* Mobile content */}
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold" mb="4">
          Mobile Layout
        </Text>
        <Text color="fg.muted" mb="4">
          On mobile, the sidebar becomes an overlay drawer. Tap outside to close.
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Switch to mobile viewport in Storybook to see the overlay behavior.
        </Text>
      </Box>
    </Box>
  ),
}