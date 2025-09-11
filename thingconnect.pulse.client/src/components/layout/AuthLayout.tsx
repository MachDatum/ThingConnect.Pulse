import type { ReactNode } from 'react';
import { Box, Grid } from '@chakra-ui/react';
import { BenefitsSection } from './BenefitsSection';

interface AuthLayoutProps {
  children: ReactNode;
  showBenefits?: boolean;
}

export function AuthLayout({ children, showBenefits = true }: AuthLayoutProps) {
  if (!showBenefits) {
    return (
      <Box h="100vh" bg="white" w="full" fontFamily="'Open Sans', sans-serif" overflow="hidden">
        <Box p={{ base: 8, lg: 16 }} display="flex" flexDirection="column" justifyContent="center" h="100vh" overflow="auto">
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box h="100vh" bg="white" w="full" fontFamily="'Open Sans', sans-serif" overflow="hidden">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} h="100vh">
        <BenefitsSection />
        <Box p={{ base: 8, lg: 16 }} display="flex" flexDirection="column" justifyContent="center" bg="white" overflow="auto">
          {children}
        </Box>
      </Grid>
    </Box>
  );
}