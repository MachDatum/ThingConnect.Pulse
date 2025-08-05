import { useState, useEffect } from 'react';
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
          try {
            const profile = await authService.getUserProfile();
            setUserProfile(profile);
            setProfileError(false);
          } catch {
            console.error('Failed to load user profile, logging out');
            setProfileError(true);
            authService.logout();
            setIsAuthenticated(false);
          }
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

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setProfileError(false);
    void (async () => {
      try {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
        setProfileError(false);
      } catch {
        console.error('Failed to load user profile after authentication');
        setProfileError(true);
      }
    })();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setProfileError(false);
  };

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
            {profileError ? 'Profile Error' : userProfile?.username || 'Loading...'}
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
}

export default App;
