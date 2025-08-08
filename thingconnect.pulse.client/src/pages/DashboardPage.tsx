import { Box, Button, Heading, Text, VStack, HStack } from '@chakra-ui/react'
import { Logo } from '@/components/ui/logo'
import { authService } from '@/services/authService'

function DashboardPage() {
  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <Box maxW="4xl" mx="auto" p="300">
      <VStack gap="500" align="stretch">
        <Box textAlign="center">
          <HStack justify="center" align="center" mb="200">
            <Logo variant="icon" size="xl" />
            <Heading textStyle="ui.heading.large">
              Welcome to Pulse
            </Heading>
          </HStack>
          <Text textStyle="ui.body.large" color="fg.muted">
            You are successfully logged in! This is where your main application content will go.
          </Text>
        </Box>

        <Box layerStyle="atlassian.card">
          <Heading textStyle="ui.heading.small" mb="200">
            Enterprise Dashboard
          </Heading>
          <Text textStyle="ui.body.medium" color="fg.muted">
            Your authenticated dashboard content goes here. The theme automatically adapts to light and dark modes using Atlassian Design System principles.
          </Text>
        </Box>
        
        <Box textAlign="center">
          <Button 
            variant="plain"
            colorPalette="danger"
            onClick={handleLogout}
            size="sm"
          >
            Logout
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

export default DashboardPage