import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm = ({ onLogin, onSwitchToRegister, isLoading, error }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onLogin(username, password);
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" shadow="md">
      <Stack gap={4} as="form" onSubmit={handleSubmit}>
        <Text fontSize="2xl" fontWeight="bold">Login</Text>
        
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
            placeholder="Enter your username"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Password *</Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          loading={isLoading}
          loadingText="Logging in..."
        >
          Login
        </Button>

        <Text>
          Don't have an account?{' '}
          <Button variant="plain" colorPalette="blue" onClick={onSwitchToRegister}>
            Register here
          </Button>
        </Text>
      </Stack>
    </Box>
  );
};