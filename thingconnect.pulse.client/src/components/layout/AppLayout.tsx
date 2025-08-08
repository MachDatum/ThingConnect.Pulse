import { Box, Flex, HStack } from "@chakra-ui/react"
import { ColorModeButton } from "../ui/color-mode"
import { Logo } from "../ui/logo"
import type { ReactNode } from "react"

interface AppLayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <Box minH="100vh" bg="bg">
      {showHeader && (
        <Box layerStyle="atlassian.header" position="sticky" top={0} zIndex={10}>
          <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
            <HStack gap="200" align="center">
              {/* Show full logo on larger screens, icon on mobile */}
              <Box display={{ base: "none", md: "block" }}>
                <Logo variant="full" size="md" />
              </Box>
              <Box display={{ base: "block", md: "none" }}>
                <Logo variant="icon" size="sm" />
              </Box>
              <Box color="fg.muted" fontWeight="400" textStyle="ui.heading.xsmall">
                .Pulse
              </Box>
            </HStack>
            <HStack gap="100">
              <ColorModeButton />
            </HStack>
          </Flex>
        </Box>
      )}
      
      <Box as="main" flex={1}>
        {children}
      </Box>
    </Box>
  )
}