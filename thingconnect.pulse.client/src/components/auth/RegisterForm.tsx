import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Logo } from '../ui/logo';

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export const RegisterForm = ({ onRegister, onSwitchToLogin, isLoading, error }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    void onRegister(username, email, password);
  };

  const passwordMismatch = password !== confirmPassword && confirmPassword !== '';

  return (
    <Box maxW="md" mx="auto" mt={8} layerStyle="enterprise.card">
      <VStack gap={6} as="form" onSubmit={handleSubmit}>
        <Box textAlign="center">
          <Logo variant="full" size="lg" mx="auto" mb={2} />
          <Text textStyle="heading.large" color="fg">Join Pulse</Text>
        </Box>
        
        <Stack gap={4} width="full">
        
        {error && (
          <Box bg="danger.muted" color="danger.fg" p={3} borderRadius="md" borderWidth={1} borderColor="danger.subtle">
            {error}
          </Box>
        )}

        <Box>
          <Text textStyle="body.small" fontWeight="medium" mb={1} color="fg">Username *</Text>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            bg="bg.panel"
            borderColor="border"
            _focus={{ borderColor: "brand.solid", boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)" }}
          />
        </Box>

        <Box>
          <Text textStyle="body.small" fontWeight="medium" mb={1} color="fg">Email *</Text>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            bg="bg.panel"
            borderColor="border"
            _focus={{ borderColor: "brand.solid", boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)" }}
          />
        </Box>

        <Box>
          <Text textStyle="body.small" fontWeight="medium" mb={1} color="fg">Password *</Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            bg="bg.panel"
            borderColor="border"
            _focus={{ borderColor: "brand.solid", boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)" }}
          />
        </Box>

        <Box>
          <Text textStyle="body.small" fontWeight="medium" mb={1} color="fg">Confirm Password *</Text>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            bg="bg.panel"
            borderColor="border"
            _focus={{ borderColor: "brand.solid", boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)" }}
          />
          {passwordMismatch && (
            <Text color="danger.fg" textStyle="body.small" mt={1}>
              Passwords do not match
            </Text>
          )}
        </Box>

        <Button
          type="submit"
          colorPalette="brand"
          width="full"
          loading={isLoading}
          loadingText="Creating account..."
          disabled={passwordMismatch}
          size="md"
        >
          Register
        </Button>

        <Text textAlign="center" color="fg.muted">
          Already have an account?{' '}
          <Button variant="plain" colorPalette="brand" onClick={onSwitchToLogin} size="sm">
            Login here
          </Button>
        </Text>
        </Stack>
      </VStack>
    </Box>
  );
};