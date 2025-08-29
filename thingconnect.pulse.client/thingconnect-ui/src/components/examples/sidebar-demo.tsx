import {
  Box,
  Text,
  IconButton,
  Stack,
} from "@chakra-ui/react"
import * as Sidebar from "@/components/ui/sidebar"
import {
  LuHome,
  LuMonitor,
  LuBell,
  LuBarChart3,
  LuSettings,
  LuUsers,
  LuShield,
  LuHelpCircle,
  LuUser,
} from "react-icons/lu"

export function SidebarDemo() {
  return (
    <Box minH="100vh" bg="bg">
      <Sidebar.Root defaultExpanded>
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
                icon={<LuHome />}
                active
              >
                Dashboard
              </Sidebar.Item>

              <Sidebar.Group id="monitoring">
                <Sidebar.GroupTrigger
                  groupId="monitoring"
                  icon={<LuMonitor />}
                  badge="12"
                >
                  Monitoring
                </Sidebar.GroupTrigger>
                <Sidebar.GroupContent groupId="monitoring">
                  <Sidebar.Item id="devices" icon={<LuMonitor />}>
                    Devices
                  </Sidebar.Item>
                  <Sidebar.Item id="services" icon={<LuMonitor />}>
                    Services
                  </Sidebar.Item>
                  <Sidebar.Item id="health-checks" icon={<LuMonitor />}>
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
                  icon={<LuBarChart3 />}
                >
                  Reports
                </Sidebar.GroupTrigger>
                <Sidebar.GroupContent groupId="reports">
                  <Sidebar.Item id="availability" icon={<LuBarChart3 />}>
                    Availability
                  </Sidebar.Item>
                  <Sidebar.Item id="performance" icon={<LuBarChart3 />}>
                    Performance
                  </Sidebar.Item>
                </Sidebar.GroupContent>
              </Sidebar.Group>

              <Sidebar.Item id="insights" icon={<LuBarChart3 />}>
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

            <Sidebar.Section title="Administration">
              <Sidebar.Item id="users" icon={<LuUsers />}>
                Users & Teams
              </Sidebar.Item>

              <Sidebar.Item id="audit" icon={<LuShield />}>
                Audit Log
              </Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Body>

          <Sidebar.Footer>
            <Stack gap="2">
              <Sidebar.Item id="help" icon={<LuHelpCircle />}>
                Help & Support
              </Sidebar.Item>
              
              <Box
                p="3"
                bg="bg.subtle"
                borderRadius="md"
                border="1px solid"
                borderColor="border.subtle"
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
            </Stack>
          </Sidebar.Footer>
        </Sidebar.Container>

        <Sidebar.Overlay />
      </Sidebar.Root>

      {/* Main content area */}
      <Box ml="240px" p="6">
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          Dashboard
        </Text>
        <Text color="fg.muted">
          This is the main content area. The sidebar will automatically adjust for mobile and collapsed states.
        </Text>
      </Box>
    </Box>
  )
}