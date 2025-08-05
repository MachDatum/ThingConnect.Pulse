import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';

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
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" shadow="md">
      <Stack gap={4} as="form" onSubmit={handleSubmit}>
        <Text fontSize="2xl" fontWeight="bold">Register</Text>
        
        {error && (
          <Box bg="red.100" color="red.800" p={3} borderRadius="md">
            {error}
          </Box>
        )}

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Username *</Text>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Email *</Text>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Password *</Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Confirm Password *</Text>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          {passwordMismatch && (
            <Text color="red.500" fontSize="sm" mt={1}>
              Passwords do not match
            </Text>
          )}
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          loading={isLoading}
          loadingText="Creating account..."
          disabled={passwordMismatch}
        >
          Register
        </Button>

        <Text>
          Already have an account?{' '}
          <Button variant="plain" colorPalette="blue" onClick={onSwitchToLogin}>
            Login here
          </Button>
        </Text>
      </Stack>
    </Box>
  );
};