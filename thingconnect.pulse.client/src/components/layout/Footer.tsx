import { Box, Text, HStack, Spacer } from '@chakra-ui/react'

export function Footer() {
  return (
    <Box
      data-testid="footer"
      bg="gray.50"
      borderTop="1px"
      borderColor="gray.200"
      px={4}
      py={2}
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.700'
      }}
    >
      <HStack gap={4} fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
        <Text data-testid="app-version">ThingConnect Pulse v1.0.0</Text>
        <Spacer />
        <Text display={{ base: 'none', md: 'block' }} data-testid="app-description">
          Network monitoring for manufacturing environments
        </Text>
      </HStack>
    </Box>
  )
}