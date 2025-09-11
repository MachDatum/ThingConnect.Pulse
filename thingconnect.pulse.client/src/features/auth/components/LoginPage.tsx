import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Heading,
  Text,
  VStack,
  Alert,
} from '@chakra-ui/react';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { AuthLayout } from '@/components/layout/AuthLayout';
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
    <AuthLayout>
      <VStack maxW="sm" mx="auto" w="full" gap={6} align="stretch">
        <VStack gap={2} textAlign="start" w="full">
          <Heading size="xl" color="gray.800" fontWeight="bold">
            Welcome Back
          </Heading>
          <Text color="gray.600" fontSize="sm" fontWeight="medium">
            Access your network monitoring dashboard
          </Text>
        </VStack>

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack gap={4}>
            <FormField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <FormField>
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <VStack gap={4} w="full" align="start">
              <LoadingButton
                type="submit"
                w="full"
                loading={isSubmitting}
                loadingText="Signing in..."
              >
                Sign In
              </LoadingButton>

              <Text textAlign="center" w="full" color="gray.600" fontSize="sm">
                Need an account? Contact your system administrator.
              </Text>
            </VStack>
          </VStack>
        </form>
      </VStack>
    </AuthLayout>
  );
}