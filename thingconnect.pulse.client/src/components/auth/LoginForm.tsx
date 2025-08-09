import { useState } from 'react'
import { Box, Button, Input, Stack, Text, VStack } from '@chakra-ui/react'
import { Logo } from '../ui/logo'

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
  isLoading: boolean
  error: string | null
}

export const LoginForm = ({ onLogin, onSwitchToRegister, isLoading, error }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void onLogin(username, password)
  }

  return (
    <Box maxW="md" mx="auto" mt="500" layerStyle="atlassian.card">
      <VStack gap="300" as="form" onSubmit={handleSubmit}>
        <Box textAlign="center">
          <Logo variant="full" size="lg" mx="auto" mb="150" />
          <Text textStyle="ui.heading.medium" color="fg">
            Login to Pulse
          </Text>
        </Box>

        <Stack gap="200" width="full">
          {error && (
            <Box
              bg="danger.muted"
              color="danger.fg"
              p="150"
              borderRadius="base"
              borderWidth={1}
              borderColor="danger.subtle"
            >
              <Text textStyle="ui.body.small">{error}</Text>
            </Box>
          )}

          <Box>
            <Text textStyle="ui.body.small" fontWeight="500" mb="050" color="fg">
              Username *
            </Text>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              bg="color.background.default"
              borderColor="border"
              borderRadius="base"
              p="100"
              _focus={{
                borderColor: 'brand.solid',
                boxShadow: '0 0 0 2px var(--chakra-colors-brand-200)',
              }}
            />
          </Box>

          <Box>
            <Text textStyle="ui.body.small" fontWeight="500" mb="050" color="fg">
              Password *
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              bg="color.background.default"
              borderColor="border"
              borderRadius="base"
              p="100"
              _focus={{
                borderColor: 'brand.solid',
                boxShadow: '0 0 0 2px var(--chakra-colors-brand-200)',
              }}
            />
          </Box>

          <Button
            type="submit"
            colorPalette="brand"
            width="full"
            loading={isLoading}
            loadingText="Logging in..."
            size="md"
            borderRadius="base"
            py="100"
          >
            <Text textStyle="ui.body.medium" fontWeight="500">
              Login
            </Text>
          </Button>

          <Text textAlign="center" color="fg.muted" textStyle="ui.body.small">
            Don't have an account?{' '}
            <Button
              variant="plain"
              colorPalette="brand"
              onClick={onSwitchToRegister}
              size="sm"
              p="050"
              textStyle="ui.body.small"
              fontWeight="500"
            >
              Register here
            </Button>
          </Text>
        </Stack>
      </VStack>
    </Box>
  )
}
