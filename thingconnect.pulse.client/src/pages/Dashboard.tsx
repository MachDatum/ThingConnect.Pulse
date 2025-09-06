import {
  Box,
  Text,
  Badge,
  Grid,
  useBreakpointValue,
  VStack,
  Heading,
  CardRoot,
  CardBody,
  Flex,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useStatusQuery } from '@/hooks/useStatusQuery';
import { StatusFilters } from '@/components/status/StatusFilters';
import { StatusTable } from '@/components/status/StatusTable';
import { StatusCard } from '@/components/status/StatusCard';
import { StatusPagination } from '@/components/status/StatusPagination';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import type { LiveStatusParams } from '@/api/types';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <CardRoot>
      <CardBody>
        <Flex align='center' justify='space-between'>
          <VStack align='start' gap='1'>
            <Text fontSize='sm' color='fg.muted' fontWeight='medium'>
              {title}
            </Text>
            <Text fontSize='3xl' fontWeight='bold' color={`${color}.500`}>
              {value}
            </Text>
          </VStack>
          <Box p='3' rounded='xl' bg={`${color}.100`}>
            <Icon size={24} color={color} />
          </Box>
        </Flex>
      </CardBody>
    </CardRoot>
  );

  return (
    <Page
      title='Dashboard'
      testId='dashboard-page'
      description='Real-time monitoring of network endpoints'
    >
      <VStack align='stretch' gap='6' mb='8'>
        <Heading size='xl'>System Overview</Heading>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }} gap='6'>
          <StatCard
            icon={Activity}
            title='Total Endpoints'
            value={statusCounts.total}
            color='blue'
          />
          <StatCard icon={CheckCircle} title='Online' value={statusCounts.up} color='green' />
          <StatCard icon={XCircle} title='Offline' value={statusCounts.down} color='red' />
          <StatCard
            icon={AlertTriangle}
            title='Flapping'
            value={statusCounts.flapping}
            color='yellow'
          />
        </Grid>
      </VStack>
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
