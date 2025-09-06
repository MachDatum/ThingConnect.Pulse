import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Container,
  Alert,
  Card,
  Stack,
  Input
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '@/components/PageLoader';

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, setupRequired } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to onboarding if setup is required
  if (setupRequired) {
    return <Navigate to="/onboarding" replace />;
  }

  // Show loading while checking auth status
  if (isLoading) {
    return <PageLoader />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login({ username: username.trim(), password });
      // Navigation handled by auth context change
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      try {
        const errorData = JSON.parse(errorMessage);
        setError(errorData.message || 'Login failed');
      } catch {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Left side - Branding */}
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        flex="1"
        bg="blue.600"
        _dark={{ bg: "blue.800" }}
        align="center"
        justify="center"
        color="white"
        position="relative"
      >
        <Container maxW="lg" textAlign="center">
          <VStack gap={8}>
            <Box>
              <Heading size="2xl" fontWeight="bold" mb={4}>
                ThingConnect Pulse
              </Heading>
              <Text fontSize="xl" opacity={0.9}>
                Network Availability Monitoring System
              </Text>
            </Box>
            
            <VStack gap={4} align="start" maxW="md">
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Real-time endpoint monitoring</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Historical data & analytics</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Automated outage detection</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Manufacturing site reliability</Text>
              </Flex>
            </VStack>
          </VStack>
        </Container>
      </Flex>

      {/* Right side - Login Form */}
      <Flex
        flex={{ base: '1', lg: '0.6' }}
        align="center"
        justify="center"
        p={8}
      >
        <Container maxW="sm" w="full">
          <Card.Root>
            <Card.Body p={8}>
              {/* Mobile Branding */}
              <Box display={{ base: 'block', lg: 'none' }} mb={8} textAlign="center">
                <Heading size="xl" color="blue.600" _dark={{ color: "blue.400" }}>
                  ThingConnect Pulse
                </Heading>
                <Text color="gray.600" _dark={{ color: "gray.400" }} mt={2}>
                  Network Monitoring System
                </Text>
              </Box>

              <VStack gap={6}>
                <Box textAlign="center">
                  <Heading size="lg" mb={2}>
                    Sign In
                  </Heading>
                  <Text color="gray.600" _dark={{ color: "gray.400" }}>
                    Access your monitoring dashboard
                  </Text>
                </Box>

                {error && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                <Box as="form" onSubmit={handleSubmit} w="full">
                  <Stack gap={4}>
                    <Field label="Username" required>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        disabled={isSubmitting}
                      />
                    </Field>

                    <Field label="Password" required>
                      <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                      />
                    </Field>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      loading={isSubmitting}
                      loadingText="Signing in..."
                      mt={4}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Box>

                <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} textAlign="center">
                  Need an account? Contact your system administrator.
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Container>
      </Flex>
    </Flex>
  );
}