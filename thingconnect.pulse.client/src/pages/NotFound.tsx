import { Box, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <Box display='flex' alignItems='center' justifyContent='center' minH='60vh' textAlign='center'>
      <VStack gap={6} maxW='md'>
        <AlertTriangle size={64} color='var(--chakra-colors-red-400)' />

        <Box>
          <Heading size='2xl' color='red.600' _dark={{ color: 'red.400' }}>
            404
          </Heading>
          <Heading size='lg' mt={2} color='gray.700' _dark={{ color: 'gray.300' }}>
            Page Not Found
          </Heading>
        </Box>

        <Text color='gray.600' _dark={{ color: 'gray.400' }}>
          The page you're looking for doesn't exist or has been moved. This might happen if you've
          entered an invalid URL or the page is still under development.
        </Text>

        <HStack gap={4}>
          <Button asChild colorPalette='blue'>
            <RouterLink to='/'>
              <Home size={16} />
              Go Home
            </RouterLink>
          </Button>

          <Button variant='ghost' onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </HStack>

        <Box p={4} borderRadius='md' bg='blue.50' _dark={{ bg: 'blue.900' }}>
          <Text fontSize='sm' color='blue.800' _dark={{ color: 'blue.200' }}>
            <strong>Available Pages:</strong>
            <br />
            Dashboard • History • Config • Settings
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
