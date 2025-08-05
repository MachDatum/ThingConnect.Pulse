import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Card,
  Input,
  Stack,
} from '@chakra-ui/react';
import { LuShield, LuUsers, LuSettings, LuArrowRight } from 'react-icons/lu';
import { authService } from '../../services/authService';

interface AdminSetupLandingProps {
  onSetupComplete: () => void;
}

export const AdminSetupLanding = ({ onSetupComplete }: AdminSetupLandingProps) => {
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        await authService.register(formData.username, formData.email, formData.password);
        onSetupComplete();
      } catch (err: unknown) {
        let errorMessage = 'Failed to create administrator account';
        
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: string; status?: number } };
          if (axiosError.response?.data) {
            errorMessage = axiosError.response.data;
          } else if (axiosError.response?.status === 0) {
            errorMessage = 'Unable to connect to server. Please ensure the backend is running.';
          }
        } else if (err && typeof err === 'object' && 'message' in err) {
          const error = err as { message: string };
          if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and ensure the backend is running.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  if (showSetupForm) {
    return (
      <Container maxW="md" py={12}>
        <Card.Root p={8}>
          <VStack gap={6} align="stretch">
            <VStack gap={2} textAlign="center">
              <Icon size="lg" color="blue.500">
                <LuShield />
              </Icon>
              <Heading size="lg">Create Administrator Account</Heading>
              <Text color="gray.600">
                Set up your first administrator account to get started with ThingConnect Pulse.
              </Text>
            </VStack>

            {error && (
              <Box bg="red.100" color="red.800" p={3} borderRadius="md" fontSize="sm">
                {error}
              </Box>
            )}

            <Stack gap={4} as="form" onSubmit={handleSetupSubmit}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Username *</Text>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder="Choose an admin username"
                  required
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Email *</Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  required
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Password *</Text>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Create a secure password"
                  required
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Confirm Password *</Text>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Confirm your password"
                  required
                />
              </Box>

              <HStack gap={3} pt={2}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSetupForm(false)}
                  disabled={isLoading}
                  flex={1}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  loading={isLoading}
                  loadingText="Creating..."
                  disabled={
                    !formData.username || 
                    !formData.email || 
                    !formData.password || 
                    !formData.confirmPassword ||
                    formData.password !== formData.confirmPassword
                  }
                  flex={1}
                >
                  Create Account
                </Button>
              </HStack>
            </Stack>
          </VStack>
        </Card.Root>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={12}>
      <VStack gap={12} align="stretch">
        <VStack gap={4} textAlign="center">
          <Icon size="2xl" color="blue.500">
            <LuShield />
          </Icon>
          <Heading size="2xl">Welcome to ThingConnect Pulse</Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            A powerful IoT device management platform that helps you monitor, control, 
            and analyze your connected devices with ease.
          </Text>
        </VStack>

        <HStack gap={8} justify="center" wrap="wrap">
          <Card.Root p={6} flex="1" minW="250px" maxW="300px">
            <VStack gap={4} textAlign="center">
              <Icon size="xl" color="blue.500">
                <LuUsers />
              </Icon>
              <Heading size="md">User Management</Heading>
              <Text color="gray.600" fontSize="sm">
                Manage user accounts, roles, and permissions with granular access control.
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={6} flex="1" minW="250px" maxW="300px">
            <VStack gap={4} textAlign="center">
              <Icon size="xl" color="green.500">
                <LuSettings />
              </Icon>
              <Heading size="md">Device Control</Heading>
              <Text color="gray.600" fontSize="sm">
                Monitor and control your IoT devices in real-time with advanced analytics.
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={6} flex="1" minW="250px" maxW="300px">
            <VStack gap={4} textAlign="center">
              <Icon size="xl" color="purple.500">
                <LuShield />
              </Icon>
              <Heading size="md">Security First</Heading>
              <Text color="gray.600" fontSize="sm">
                Enterprise-grade security with JWT authentication and role-based access.
              </Text>
            </VStack>
          </Card.Root>
        </HStack>

        <VStack gap={4} textAlign="center">
          <Heading size="lg">Get Started</Heading>
          <Text color="gray.600" maxW="lg">
            To begin using ThingConnect Pulse, you'll need to create the first administrator account. 
            This account will have full access to manage the system and create additional users.
          </Text>
          <Button
            size="lg"
            colorScheme="blue"
            onClick={() => setShowSetupForm(true)}
          >
            Create Administrator Account
            <LuArrowRight style={{ marginLeft: '8px' }} />
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};