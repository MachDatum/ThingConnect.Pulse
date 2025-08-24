import { Box, Spinner } from '@chakra-ui/react'

export function PageLoader() {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minH="200px"
      data-testid="suspense-fallback"
    >
      <Spinner size="lg" />
    </Box>
  )
}