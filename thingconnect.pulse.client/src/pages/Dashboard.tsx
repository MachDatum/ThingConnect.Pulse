import { Box, Text, Badge, Grid, useBreakpointValue } from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useStatusQuery } from '@/hooks/useStatusQuery';
import { StatusFilters } from '@/components/status/StatusFilters';
import { StatusTable } from '@/components/status/StatusTable';
import { StatusCard } from '@/components/status/StatusCard';
import { StatusPagination } from '@/components/status/StatusPagination';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import type { LiveStatusParams } from '@/api/types';

export default function Dashboard() {
  const [filters, setFilters] = useState<LiveStatusParams>({
    page: 1,
    pageSize: 50,
  });

  const { data, isLoading } = useStatusQuery(filters);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Extract unique groups for filter dropdown
  const groups = useMemo(() => {
    if (!data?.items) return [];
    const groupSet = new Set(data.items.map(item => item.endpoint.group.name));
    return Array.from(groupSet).sort();
  }, [data?.items]);

  // Count status totals
  const statusCounts = useMemo(() => {
    if (!data?.items) return { total: 0, up: 0, down: 0, flapping: 0 };

    const counts = data.items.reduce(
      (acc, item) => {
        acc.total++;
        acc[item.status]++;
        return acc;
      },
      { total: 0, up: 0, down: 0, flapping: 0 }
    );

    return counts;
  }, [data?.items]);

  const handleFiltersChange = (newFilters: LiveStatusParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }));
  };

  return (
    <Page
      title='Dashboard'
      testId='dashboard-page'
      description='Real-time monitoring of network endpoints'
    >
      {/* <PageHeader
        title="Network Status Dashboard"
        description="Real-time monitoring of network endpoints"
        icon={<Activity size={20} />}
      /> */}
      <PageSection title='System Overview'>
        <Box
          p={3}
          borderRadius='md'
          bg='gray.50'
          _dark={{ bg: 'gray.800' }}
          border='1px solid'
          borderColor='gray.200'
        >
          <Grid templateColumns='repeat(auto-fit, minmax(120px, 1fr))' gap={2}>
            <Box display='flex' justifyContent='space-between' alignItems='center' h='32px'>
              <Text fontSize='sm'>Total:</Text>
              <Badge colorPalette='blue' size='sm'>
                {statusCounts.total}
              </Badge>
            </Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' h='32px'>
              <Text fontSize='sm'>Online:</Text>
              <Badge colorPalette='green' size='sm'>
                {statusCounts.up}
              </Badge>
            </Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' h='32px'>
              <Text fontSize='sm'>Offline:</Text>
              <Badge colorPalette='red' size='sm'>
                {statusCounts.down}
              </Badge>
            </Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' h='32px'>
              <Text fontSize='sm'>Flapping:</Text>
              <Badge colorPalette='yellow' size='sm'>
                {statusCounts.flapping}
              </Badge>
            </Box>
          </Grid>
          <Text
            fontSize='sm'
            color='gray.600'
            _dark={{ color: 'gray.400' }}
            textAlign='right'
            mt={1}
          >
            {isLoading ? 'Updating...' : 'Just now'}
          </Text>
        </Box>
      </PageSection>

      <StatusFilters filters={filters} onFiltersChange={handleFiltersChange} groups={groups} />

      {data && (
        <PageSection>
          {isMobile ? (
            <Grid templateColumns='repeat(auto-fill, minmax(280px, 1fr))' gap={2}>
              {data.items.map(item => (
                <StatusCard key={item.endpoint.id} item={item} />
              ))}
            </Grid>
          ) : (
            <Box overflowX='auto'>
              <StatusTable items={data.items} isLoading={isLoading} />
            </Box>
          )}

          <StatusPagination
            meta={data.meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </PageSection>
      )}
    </Page>
  );
}
