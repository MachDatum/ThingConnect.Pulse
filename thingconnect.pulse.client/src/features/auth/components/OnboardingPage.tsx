import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Flex, Heading, Text, VStack, Alert, Stack, Progress } from '@chakra-ui/react';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { LoadingButton } from '@/components/form/LoadingButton';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '@/components/PageLoader';
import { Switch } from '@/components/ui/switch';
import { useTelemetryConsent } from '../hooks/useTelemetryConsent';

export default function OnboardingPage() {
  const { register, isLoading, isAuthenticated, setupRequired } = useAuth();
  const { saveTelemetryConsent } = useTelemetryConsent();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [telemetryConsent, setTelemetryConsent] = useState({
    errorDiagnostics: true,  // Default ON
    usageAnalytics: true     // Default ON
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  // Redirect to login if setup is not required
  if (!setupRequired && !isLoading) {
    return <Navigate to='/login' replace />;
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
      // Register the user
      await register(formData);
      
      // Save telemetry consent preferences after successful registration
      await saveTelemetryConsent(telemetryConsent);
      
      // Navigation will be handled by auth context change (redirect to dashboard)
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
      <Box textAlign='center'>
        <Heading size='lg' mb={2} color='gray.800' fontWeight='bold'>
          Administrator Account
        </Heading>
        <Text color='gray.600' fontSize='lg' fontWeight='medium'>
          Create your administrator account to get started
        </Text>
      </Box>

      <Stack gap={4} w='full'>
        <FormField
          type='text'
          value={formData.username}
          onChange={e => updateFormData('username', e.target.value)}
          placeholder='Choose a username'
          disabled={isSubmitting}
        />

        <FormField
          type='email'
          value={formData.email}
          onChange={e => updateFormData('email', e.target.value)}
          placeholder='Enter your email address'
          disabled={isSubmitting}
        />
      </Stack>

      {/* Telemetry Consent Section */}
      <VStack gap={4} w="full" align="start" p={4} bg="gray.50" rounded="md">
        <Box>
          <Text fontSize="md" fontWeight="medium" color="gray.800" mb={1}>
            Help improve ThingConnect Pulse? (Optional)
          </Text>
          <Text fontSize="sm" color="gray.600">
            Enable anonymous diagnostics to help us fix crashes faster and improve features.
          </Text>
        </Box>

        <Stack gap={3} w="full">
          <Flex justify="space-between" align="center">
            <VStack align="start" gap={0} flex="1">
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                Send sanitized error diagnostics
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exception types, stack traces (no sensitive data)
              </Text>
            </VStack>
            <Switch
              checked={telemetryConsent.errorDiagnostics}
              onCheckedChange={(details) => setTelemetryConsent(prev => ({ ...prev, errorDiagnostics: details.checked }))}
              colorPalette="blue"
              size="sm"
              disabled={isSubmitting}
            />
          </Flex>

          <Flex justify="space-between" align="center">
            <VStack align="start" gap={0} flex="1">
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                Send anonymous usage analytics
              </Text>
              <Text fontSize="xs" color="gray.600">
                Feature usage counts (no personal information)
              </Text>
            </VStack>
            <Switch
              checked={telemetryConsent.usageAnalytics}
              onCheckedChange={(details) => setTelemetryConsent(prev => ({ ...prev, usageAnalytics: details.checked }))}
              colorPalette="blue"
              size="sm"
              disabled={isSubmitting}
            />
          </Flex>
        </Stack>
      </VStack>

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
      <Box textAlign='center'>
        <Heading size='lg' mb={2} color='gray.800' fontWeight='bold'>
          Secure Your Account
        </Heading>
        <Text color='gray.600' fontSize='lg' fontWeight='medium'>
          Choose a strong password for your administrator account
        </Text>
      </Box>

      <Stack gap={4} w='full'>
        <PasswordInput
          value={formData.password}
          onChange={e => updateFormData('password', e.target.value)}
          placeholder='Enter a strong password'
          disabled={isSubmitting}
        />

        <PasswordInput
          value={formData.confirmPassword}
          onChange={e => updateFormData('confirmPassword', e.target.value)}
          placeholder='Confirm your password'
          disabled={isSubmitting}
        />
      </Stack>

      <Stack direction='row' gap={4} w='full'>
        <LoadingButton
          variant='outline'
          size='lg'
          flex='1'
          onClick={handleBack}
          isLoading={isSubmitting}
          bg='transparent'
          color='#076bb3'
          borderColor='#076bb3'
          _hover={{ bg: '#076bb3', color: 'white' }}
          _disabled={{
            bg: 'transparent',
            color: 'gray.400',
            borderColor: 'gray.400',
            cursor: 'not-allowed',
            _hover: { bg: 'transparent', color: 'gray.400' },
          }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          size='lg'
          flex='1'
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText='Creating account...'
        >
          Create Account
        </LoadingButton>
      </Stack>
    </VStack>
  );


  return (
    <AuthLayout>
      <VStack gap={6} w='full' maxH='100%' overflow='auto'>
        {/* Progress Bar */}
        <Box w='full'>
          <Flex justify='space-between' align='center' mb={2}>
            <Text fontSize='sm' color='gray.600' fontWeight='medium'>
              Step {currentStep} of 2
            </Text>
            <Text fontSize='sm' color='gray.600' fontWeight='medium'>
              {Math.round((currentStep / 2) * 100)}%
            </Text>
          </Flex>
          <Progress.Root value={(currentStep / 2) * 100} colorPalette='blue'>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        {error && (
          <Alert.Root status='error' variant='subtle' w='full'>
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </VStack>
    </AuthLayout>
  );
}
