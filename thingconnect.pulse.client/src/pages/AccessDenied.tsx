import { Container, Flex, VStack, Heading, Text, Button, Box } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function AccessDenied() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} align="center" justify="center" overflow="hidden">
      <Container maxW="md" textAlign="center">
        <VStack gap={8}>
          <Box>
            <Text fontSize="6xl" fontWeight="bold" color="red.500">
              403
            </Text>
            <Heading size="xl" mb={4}>
              Access Denied
            </Heading>
            <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.400" }}>
              You don't have permission to access this resource.
            </Text>
          </Box>

          <VStack gap={4}>
            <Text color="gray.500" _dark={{ color: "gray.500" }}>
              This page requires administrator privileges.
            </Text>
            
            <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
              <Button asChild colorScheme="blue" variant="outline">
                <Link to="/">Go to Dashboard</Link>
              </Button>
              <Button onClick={handleLogout} colorScheme="gray">
                Sign Out
              </Button>
            </Flex>
          </VStack>
        </VStack>
      </Container>
    </Flex>
  );
}