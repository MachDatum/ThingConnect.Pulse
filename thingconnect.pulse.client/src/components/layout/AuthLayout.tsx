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
      <Box minH='100vh' bg='white' w='full' fontFamily="'Open Sans', sans-serif">
        <Box
          p={{ base: 8, lg: 16 }}
          display='flex'
          flexDirection='column'
          justifyContent='center'
          minH='100vh'
        >
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box minH='100vh' bg='white' w='full' fontFamily="'Open Sans', sans-serif">
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} minH='100vh'>
        <BenefitsSection />
        <Box
          p={{ base: 8, lg: 16 }}
          display='flex'
          flexDirection='column'
          justifyContent='center'
          bg='white'
        >
          {children}
        </Box>
      </Grid>
    </Box>
  );
}
