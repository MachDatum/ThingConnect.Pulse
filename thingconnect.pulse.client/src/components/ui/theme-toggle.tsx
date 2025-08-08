"use client"

import { 
  Button, 
  HStack, 
  VStack, 
  Text, 
  Box,
  Heading,
  Stack
} from "@chakra-ui/react"
import { ColorModeButton } from "./color-mode"
import { LuPalette, LuSun, LuMoon } from "react-icons/lu"
import { useColorMode } from "../../lib/color-mode"

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box
      layerStyle="enterprise.card"
      maxW="md"
      mx="auto"
    >
      <VStack gap={4}>
        <HStack gap={2}>
          <LuPalette size={20} />
          <Heading size="md">Theme Settings</Heading>
        </HStack>
        
        <Text textStyle="body.medium" color="fg.muted" textAlign="center">
          Switch between light and dark themes for the best viewing experience
        </Text>
        
        <Stack direction={{ base: "column", sm: "row" }} gap={3} width="full">
          <Button
            variant={colorMode === "light" ? "solid" : "outline"}
            colorPalette="brand"
            size="md"
            onClick={() => colorMode === "dark" && toggleColorMode()}
            flex={1}
          >
            <LuSun />
            Light Mode
          </Button>
          
          <Button
            variant={colorMode === "dark" ? "solid" : "outline"}
            colorPalette="brand"
            size="md"
            onClick={() => colorMode === "light" && toggleColorMode()}
            flex={1}
          >
            <LuMoon />
            Dark Mode
          </Button>
        </Stack>
        
        <HStack gap={2}>
          <Text textStyle="caption" color="fg.subtle">
            Current theme:
          </Text>
          <Text textStyle="caption" fontWeight="semibold" color="brand.fg">
            {colorMode === "light" ? "Light" : "Dark"}
          </Text>
          <ColorModeButton size="xs" />
        </HStack>
      </VStack>
    </Box>
  )
}

export function EnterpriseThemeShowcase() {
  return (
    <VStack gap={8} p={6} maxW="4xl" mx="auto">
      <Box textAlign="center">
        <Heading textStyle="display.medium" mb={4}>
          ThingConnect.Pulse
        </Heading>
        <Text textStyle="body.large" color="fg.muted" mb={8}>
          Enterprise Theme System with Light & Dark Mode Support
        </Text>
      </Box>

      <ThemeToggle />

      <Stack direction={{ base: "column", lg: "row" }} gap={6} width="full">
        {/* Brand Colors Card */}
        <Box layerStyle="enterprise.card" flex={1}>
          <VStack gap={4} align="stretch">
            <Heading textStyle="heading.small">Brand Colors</Heading>
            <HStack gap={2} wrap="wrap">
              <Box bg="brand.solid" color="brand.contrast" px={3} py={2} borderRadius="md" textStyle="caption">
                Primary
              </Box>
              <Box bg="success.solid" color="success.contrast" px={3} py={2} borderRadius="md" textStyle="caption">
                Success
              </Box>
              <Box bg="warning.solid" color="warning.contrast" px={3} py={2} borderRadius="md" textStyle="caption">
                Warning
              </Box>
              <Box bg="danger.solid" color="danger.contrast" px={3} py={2} borderRadius="md" textStyle="caption">
                Danger
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* Typography Card */}
        <Box layerStyle="enterprise.card" flex={1}>
          <VStack gap={4} align="stretch">
            <Heading textStyle="heading.small">Typography</Heading>
            <VStack gap={2} align="stretch">
              <Text textStyle="heading.large">Heading Large</Text>
              <Text textStyle="body.medium">Body Medium Text</Text>
              <Text textStyle="caption">Caption Text</Text>
              <Text textStyle="overline">Overline Text</Text>
            </VStack>
          </VStack>
        </Box>
      </Stack>

      {/* Layout Examples */}
      <Stack direction={{ base: "column", lg: "row" }} gap={6} width="full">
        <Box layerStyle="enterprise.section" flex={1}>
          <Text textStyle="body.medium" mb={2}>Section Style</Text>
          <Text textStyle="body.small" color="fg.muted">
            This uses the enterprise.section layer style for content areas.
          </Text>
        </Box>
        
        <Box layerStyle="enterprise.header" flex={1}>
          <Text textStyle="body.medium" mb={2}>Header Style</Text>
          <Text textStyle="body.small" color="fg.muted">
            This uses the enterprise.header layer style for navigation areas.
          </Text>
        </Box>
      </Stack>

      <Box 
        bg="bg.muted" 
        border="1px solid" 
        borderColor="border.subtle" 
        borderRadius="lg" 
        p={6} 
        width="full"
      >
        <Text textStyle="body.medium" color="fg" textAlign="center">
          🎨 Professional enterprise theme with semantic color tokens that automatically adapt to light and dark modes
        </Text>
      </Box>
    </VStack>
  )
}