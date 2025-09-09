import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Alert,
  Stack,
  Progress
} from '@chakra-ui/react';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { LoadingButton } from '@/components/form/LoadingButton';
import { AuthLayout } from '@/components/layout/AuthLayout';
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
        <Heading size="lg" mb={2} color="gray.800" fontWeight="bold">
          Administrator Account
        </Heading>
        <Text color="gray.600" fontSize="lg" fontWeight="medium">
          Create your administrator account to get started
        </Text>
      </Box>

      <Stack gap={4} w="full">
        <FormField
          type="text"
          value={formData.username}
          onChange={(e) => updateFormData('username', e.target.value)}
          placeholder="Choose a username"
          disabled={isSubmitting}
        />

        <FormField
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="Enter your email address"
          disabled={isSubmitting}
        />
      </Stack>

      <LoadingButton
        size="lg"
        w="full"
        onClick={handleNext}
        isLoading={isSubmitting}
      >
        Continue
      </LoadingButton>
    </VStack>
  );

  const renderStep2 = () => (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2} color="gray.800" fontWeight="bold">
          Secure Your Account
        </Heading>
        <Text color="gray.600" fontSize="lg" fontWeight="medium">
          Choose a strong password for your administrator account
        </Text>
      </Box>

      <Stack gap={4} w="full">
        <PasswordInput
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          placeholder="Enter a strong password"
          disabled={isSubmitting}
        />

        <PasswordInput
          value={formData.confirmPassword}
          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
          placeholder="Confirm your password"
          disabled={isSubmitting}
        />
      </Stack>

      <Stack direction="row" gap={4} w="full">
        <LoadingButton
          variant="outline"
          size="lg"
          flex="1"
          onClick={handleBack}
          isLoading={isSubmitting}
          bg="transparent"
          color="#076bb3"
          borderColor="#076bb3"
          _hover={{ bg: "#076bb3", color: "white" }}
          _disabled={{
            bg: "transparent",
            color: "gray.400",
            borderColor: "gray.400",
            cursor: "not-allowed",
            _hover: { bg: "transparent", color: "gray.400" }
          }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          size="lg"
          flex="1"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Creating account..."
        >
          Create Account
        </LoadingButton>
      </Stack>
    </VStack>
  );

  const renderStep3 = () => (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2} color="#076bb3" fontWeight="bold">
          Setup Complete!
        </Heading>
        <Text color="gray.600" fontSize="lg" fontWeight="medium">
          Your ThingConnect Pulse system is ready to use
        </Text>
      </Box>

      <VStack gap={4} align="start" maxW="md" w="full">
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="#076bb3" rounded="full" />
          <Text color="gray.800" fontWeight="medium">Administrator account created</Text>
        </Flex>
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="#076bb3" rounded="full" />
          <Text color="gray.800" fontWeight="medium">System authentication configured</Text>
        </Flex>
        <Flex align="center" gap={3}>
          <Box w={2} h={2} bg="#076bb3" rounded="full" />
          <Text color="gray.800" fontWeight="medium">Ready to monitor your network</Text>
        </Flex>
      </VStack>

      <Text fontSize="sm" color="gray.600" fontWeight="medium" textAlign="center">
        You will be automatically logged in and redirected to the dashboard
      </Text>
    </VStack>
  );


  return (
    <AuthLayout>
      <VStack gap={6} w="full">
        {/* Progress Bar */}
        <Box w="full">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Step {currentStep} of 2
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {Math.round((currentStep / 2) * 100)}%
            </Text>
          </Flex>
          <Progress.Root value={(currentStep / 2) * 100} colorPalette="blue">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        {error && (
          <Alert.Root status="error" variant="subtle" w="full">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </VStack>
    </AuthLayout>
  );
}