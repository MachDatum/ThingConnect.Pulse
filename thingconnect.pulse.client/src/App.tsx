import { useState, useEffect } from 'react'
import { AuthScreen } from './components/auth/AuthScreen'
import { AppLayout } from './components/layout/AppLayout'
import { authService } from './services/authService'
import { Box, Button, Heading, Text, VStack, HStack } from '@chakra-ui/react'
import { Logo } from './components/ui/logo'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = () => {
      try {
        const isLoggedIn = authService.isAuthenticated()
        setIsAuthenticated(isLoggedIn)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="50vh">
          <Text>Loading...</Text>
        </Box>
      </AppLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </AppLayout>
    )
  }

  // Main authenticated app content
  return (
    <AppLayout>
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
    </AppLayout>
  )
}

export default App
