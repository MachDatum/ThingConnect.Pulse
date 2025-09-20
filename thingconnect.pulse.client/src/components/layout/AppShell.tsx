import { Outlet } from 'react-router-dom';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { FloatingActions } from './FloatingActions';
import { testId } from '@/utils/testUtils';
import { ARIA_ROLES } from '@/utils/ariaUtils';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = useBreakpointValue({ base: '100%', md: '250px' });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div data-testid={testId.page('app-shell')}>
      <Flex h='100dvh' direction='column'>
        <Flex flex='1' overflow='hidden' data-testid={testId.custom(['main', 'layout'])}>
          {/* Navigation Sidebar */}
          <aside
            role={ARIA_ROLES.COMPLEMENTARY}
            aria-label="Main navigation"
            data-testid={testId.custom(['navigation', 'sidebar'])}
          >
            <Box
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
          </aside>

          {/* Overlay for mobile */}
          {isMobile && isSidebarOpen && (
            <Box
              data-testid={testId.custom(['mobile', 'overlay'])}
              position='fixed'
              top='60px'
              left='0'
              right='0'
              bottom='0'
              bg='blackAlpha.600'
              zIndex={999}
              onClick={toggleSidebar}
              aria-label='Close navigation'
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSidebar();
                }
              }}
            />
          )}

          {/* Main content */}
          <main
            role={ARIA_ROLES.MAIN}
            aria-label="Main content"
            data-testid={testId.pageContent('main')}
          >
            <Box flex='1' _dark={{ bg: 'gray.900' }} h={'full'} w={'full'}>
              <Outlet />
            </Box>
          </main>
        </Flex>

        {/* Footer */}
        <Footer />

        {/* Floating Actions (Theme Toggle + Help Button) */}
        <FloatingActions />
      </Flex>
    </div>
  );
}
