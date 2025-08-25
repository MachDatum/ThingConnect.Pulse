import { Box, Text, HStack, Spacer, Link } from '@chakra-ui/react';

export function Footer() {
  return (
    <Box
      data-testid='footer'
      bg='gray.50'
      borderTop='1px'
      borderColor='gray.200'
      px={4}
      py={2}
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.700',
      }}
    >
      <HStack gap={4} fontSize='xs' color='gray.500' _dark={{ color: 'gray.400' }}>
        <Text data-testid='app-version'>ThingConnect Pulse v1.0.0</Text>
        <Spacer />
        <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
          <Text data-testid='app-description'>
            Network monitoring for manufacturing environments
          </Text>
          <Text>•</Text>
          <Link
            data-testid='thingconnect-link'
            href='https://thingconnect.com'
            target='_blank'
            rel='noopener noreferrer'
            color='blue.600'
            _dark={{ color: 'blue.400' }}
            _hover={{ textDecoration: 'underline' }}
          >
            Powered by ThingConnect
          </Link>
        </HStack>
        
        {/* Mobile footer with branding */}
        <Text display={{ base: 'block', md: 'none' }} data-testid='mobile-branding'>
          Powered by ThingConnect
        </Text>
      </HStack>
    </Box>
  );
}
