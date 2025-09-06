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
  Progress,
  Input
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '@/components/PageLoader';

export default function OnboardingPage() {
  const { register, isLoading, isAuthenticated, setupRequired } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if setup is not required
  if (!setupRequired && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking auth status
  if (isLoading) {
    return <PageLoader />;
  }

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.username.trim()) {
          setError('Username is required');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (!formData.confirmPassword) {
          setError('Please confirm your password');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    setError('');

    try {
      await register(formData);
      // Navigation handled by auth context change
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      try {
        const errorData = JSON.parse(errorMessage);
        setError(errorData.message || 'Registration failed');
      } catch {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const renderStep1 = () => (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2}>
          Administrator Account
        </Heading>
        <Text color="gray.600" _dark={{ color: "gray.400" }}>
          Create your administrator account to get started
        </Text>
      </Box>

      <Stack gap={4} w="full">
        <Field label="Username" required>
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => updateFormData('username', e.target.value)}
            placeholder="Choose a username"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Email Address" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </Field>
      </Stack>

      <Button
        colorScheme="blue"
        size="lg"
        w="full"
        onClick={handleNext}
        disabled={isSubmitting}
      >
        Continue
      </Button>
    </VStack>
  );

  const renderStep2 = () => (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2}>
          Secure Your Account
        </Heading>
        <Text color="gray.600" _dark={{ color: "gray.400" }}>
          Choose a strong password for your administrator account
        </Text>
      </Box>

      <Stack gap={4} w="full">
        <Field label="Password" required>
          <PasswordInput
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            placeholder="Enter a strong password"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Confirm Password" required>
          <PasswordInput
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            disabled={isSubmitting}
          />
        </Field>
      </Stack>

      <Stack direction="row" gap={4} w="full">
        <Button
          variant="outline"
          size="lg"
          flex="1"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          colorScheme="blue"
          size="lg"
          flex="1"
          onClick={handleSubmit}
          loading={isSubmitting}
          loadingText="Creating account..."
        >
          Create Account
        </Button>
      </Stack>
    </VStack>
  );

  const renderStep3 = () => (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2} color="green.600" _dark={{ color: "green.400" }}>
          Setup Complete!
        </Heading>
        <Text color="gray.600" _dark={{ color: "gray.400" }}>
          Your ThingConnect Pulse system is ready to use
        </Text>
      </Box>

      <VStack gap={4} align="start" maxW="md" w="full">
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="green.500" rounded="full" />
          <Text>Administrator account created</Text>
        </Flex>
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="green.500" rounded="full" />
          <Text>System authentication configured</Text>
        </Flex>
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="green.500" rounded="full" />
          <Text>Ready to monitor your network</Text>
        </Flex>
      </VStack>

      <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} textAlign="center">
        You will be automatically logged in and redirected to the dashboard
      </Text>
    </VStack>
  );

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
                Initial System Setup
              </Text>
            </Box>
            
            <VStack gap={4} align="start" maxW="md">
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Configure administrator access</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Secure authentication system</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Quick 2-minute setup</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Box w={2} h={2} bg="white" rounded="full" />
                <Text>Start monitoring immediately</Text>
              </Flex>
            </VStack>
          </VStack>
        </Container>
      </Flex>

      {/* Right side - Onboarding Form */}
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
                  Initial System Setup
                </Text>
              </Box>

              {/* Progress Bar */}
              <Box mb={8}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                    Step {currentStep} of 2
                  </Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                    {Math.round((currentStep / 2) * 100)}%
                  </Text>
                </Flex>
                <Progress.Root value={(currentStep / 2) * 100} colorScheme="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>

              {error && (
                <Alert.Root status="error" variant="subtle" mb={6}>
                  <Alert.Indicator />
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
              )}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </Card.Body>
          </Card.Root>
        </Container>
      </Flex>
    </Flex>
  );
}