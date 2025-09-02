import { Outlet } from 'react-router-dom';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = useBreakpointValue({ base: '100%', md: '250px' });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Flex h='100vh' direction='column' data-testid='app-shell'>
      <Flex flex='1' overflow='hidden' data-testid='main-layout'>
        {/* Navigation Sidebar */}
        <Box
          data-testid='navigation-sidebar'
          position={{ base: 'fixed', md: 'relative' }}
          left={{ base: isSidebarOpen ? 0 : '-100%', md: 0 }}
          top={{ base: '60px', md: 0 }}
          w={sidebarWidth}
          h={{ base: 'calc(100vh - 60px)', md: '100%' }}
          bg='gray.100'
          borderRight='1px'
          borderColor='gray.200'
          transition='left 0.3s ease'
          zIndex={{ base: 1000, md: 'auto' }}
          _dark={{
            bg: 'gray.800',
            borderColor: 'gray.700',
          }}
        >
          <Navigation onItemClick={isMobile ? toggleSidebar : undefined} />
        </Box>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <Box
            data-testid='mobile-overlay'
            position='fixed'
            top='60px'
            left='0'
            right='0'
            bottom='0'
            bg='blackAlpha.600'
            zIndex={999}
            onClick={toggleSidebar}
            aria-label='Close navigation'
          />
        )}

        {/* Main content */}
        <Box
          data-testid='page-content'
          flex='1'
          overflow='auto'
          bg='white'
          _dark={{ bg: 'gray.900' }}
        >
          <Box p={6} maxW='full'>
            <Outlet />
          </Box>
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}
