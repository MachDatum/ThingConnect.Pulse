import { Box, VStack, Heading, Text, Button, Image, Flex, HStack } from '@chakra-ui/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import thingConnectIcon from '@/assets/thingconnect-logo.png';
import pageNotFound from '@/assets/page-not-found.png';

export default function NotFound() {
  return (
    <Flex align='center' justify='center' h='100vh' px={{ base: 6, md: 12 }} overflow='hidden'>
      <Flex
        w='full'
        maxW='7xl'
        align='center'
        justify='space-between'
        gap={{ base: 10, md: 20 }}
        flexDir={{ base: 'column', md: 'row' }}
      >
        <VStack
          align={{ base: 'center', md: 'start' }}
          gap={6}
          flex='1'
          maxW={{ base: 'full', md: 'lg' }}
          textAlign={{ base: 'center', md: 'start' }}
        >
          <Image src={thingConnectIcon} alt='Thing Connect Pulse' h='12' objectFit='contain' />
          <Heading size='2xl'>404</Heading>
          <Heading size='lg' color='fg.muted'>
            Page Not Found
          </Heading>
          <Text color='fg.muted'>
            The page you're looking for doesn't exist or has been moved. This might happen if you
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
        </VStack>
        <Box flex='1'>
          <Image
            src={pageNotFound}
            alt='404 Illustration'
            borderRadius='lg'
            objectFit='contain'
            w={{ base: '100%', md: 'xl' }}
            h='auto'
          />
        </Box>
      </Flex>
    </Flex>
  );
}
