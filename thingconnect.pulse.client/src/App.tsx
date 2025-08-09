<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthScreen } from './components/auth/AuthScreen'
import { AppLayout } from './components/layout/AppLayout'
import { authService } from './services/authService'
import { Box, Text } from '@chakra-ui/react'
import DashboardPage from './pages/DashboardPage'
import ThemeShowcasePage from './pages/ThemeShowcasePage'
import ProtectedRoute from './components/routing/ProtectedRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

  if (isLoading) {
    return (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="50vh">
          <Text>Loading...</Text>
        </Box>
      </AppLayout>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <AppLayout>
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            </AppLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/theme-showcase"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ThemeShowcasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
=======
import { useState, useEffect, useCallback } from 'react';
import { Box, Spinner, Center, Flex, Text, HStack, Button, Avatar } from '@chakra-ui/react';
import { AdminSetupLanding } from './components/setup/AdminSetupLanding';
import { AuthScreen } from './components/auth/AuthScreen';
import { setupService } from './services/setupService';
import { authService, type UserProfile } from './services/authService';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    void checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      const setupStatus = await setupService.checkSetupStatus();
      
      if (setupStatus.isSetupRequired) {
        setNeedsSetup(true);
      } else {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          await loadUserProfile();
        }
      }
    } catch {
      setNeedsSetup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    try {
      await setupService.completeSetup();
      setNeedsSetup(false);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(authService.isAuthenticated());
    }
  };

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    void loadUserProfile();
  }, [loadUserProfile]);

  const loadUserProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    
    setProfileLoading(true);
    setProfileError(false);
    
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
      setProfileError(false);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setProfileError(true);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setProfileError(false);
    setProfileLoading(false);
  }, []);

  const handleRetryProfile = useCallback(() => {
    void loadUserProfile();
  }, [loadUserProfile]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (needsSetup) {
    return <AdminSetupLanding onSetupComplete={() => void handleSetupComplete()} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="gray.200">
        <Text fontSize="xl" fontWeight="bold">ThingConnect Pulse</Text>
        <HStack gap={3}>
          <Avatar.Root size="sm" bg="blue.500">
            <Avatar.Fallback name={userProfile?.username || 'User'} />
          </Avatar.Root>
          <Text fontSize="sm" fontWeight="medium">
            {profileError ? (
              <Text as="span" color="red.500" cursor="pointer" onClick={handleRetryProfile}>
                Profile Error (click to retry)
              </Text>
            ) : profileLoading ? 'Loading...' : userProfile?.username || 'Loading...'}
          </Text>
          <Button 
            size="sm" 
            variant="outline" 
            colorScheme="red"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>
      </Flex>
      <Box p={8}>
        <Center>
          <Box textAlign="center">
            <h1>Welcome to ThingConnect Pulse Dashboard</h1>
            <p>You are successfully logged in!</p>
          </Box>
        </Center>
      </Box>
    </Box>
  );
>>>>>>> 8970e5ce26ad4454c134a92623c57322e7f1d8b1
}

export default App;
