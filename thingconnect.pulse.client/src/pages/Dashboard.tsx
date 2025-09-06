import {
  Box,
  Text,
  Badge,
  Grid,
  useBreakpointValue,
  VStack,
  Heading,
  Flex,
  HStack,
  Checkbox,
  Card,
  CheckboxGroup,
  Accordion,
  Fieldset,
} from '@chakra-ui/react';
import { useState, useMemo, useCallback } from 'react';
import { useStatusQuery } from '@/hooks/useStatusQuery';
import { StatusFilters } from '@/components/status/StatusFilters';
import { StatusTable } from '@/components/status/StatusTable';
import { StatusCard } from '@/components/status/StatusCard';
import { StatusPagination } from '@/components/status/StatusPagination';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import type { LiveStatusParams } from '@/api/types';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface LiveStatusItem {
  endpoint: {
    id: string;
    group: { name: string };
  };
  status: 'flapping' | 'up' | 'down';
  name: string;
  host: string;
}

type GroupedEndpoints = any[] | Record<string, any[]>;

export default function Dashboard() {
  const [filters, setFilters] = useState<LiveStatusParams>({
    page: 1,
    pageSize: 50,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useStatusQuery({
    ...filters,
    search: searchTerm,
  });

  // Grouping options state
  const [groupByOptions, setGroupByOptions] = useState<string[]>([]);

  // Grouped and filtered endpoints
  const groupedEndpoints = useMemo(() => {
    if (!data?.items) return null;

    const result: Record<string, any> = {};

    // First, filter the items based on search term if applicable
    const filteredItems = searchTerm
      ? data.items.filter(
          (e: any) =>
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.host?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : data.items;

    // Group by Status first (mandatory)
    const statusGrouped: Record<'up' | 'down' | 'flapping', GroupedEndpoints> = {
      up: [],
      down: [],
      flapping: [],
    };

    // First, push items into the status buckets
    filteredItems.forEach(item => {
      const bucket = statusGrouped[item.status]; // ✅ now works
      if (Array.isArray(bucket)) bucket.push(item);
    });

    // If "group" option is selected, further group by endpoint.group.name
    if (groupByOptions.includes('group')) {
      (Object.keys(statusGrouped) as Array<'up' | 'down' | 'flapping'>).forEach(status => {
        const bucket = statusGrouped[status];
        if (Array.isArray(bucket)) {
          const groupedByGroup: Record<string, LiveStatusItem[]> = {};
          bucket.forEach(item => {
            const group = item.endpoint.group.name;
            if (!groupedByGroup[group]) groupedByGroup[group] = [];
            groupedByGroup[group].push(item);
          });
          statusGrouped[status] = groupedByGroup;
        }
      });
    }
    return statusGrouped;
  }, [data?.items, groupByOptions, searchTerm]);

  // Handler for group by options
  const toggleGroupByOption = useCallback((option: string) => {
    setGroupByOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  }, []);
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

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
  }: {
    icon: React.ComponentType<{ size: number; color: string }>;
    title: string;
    value: number;
    color: string;
  }) => (
    <Card.Root>
      <Card.Body>
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
      </Card.Body>
    </Card.Root>
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
      {/* Group By Menu */}
      <VStack align='stretch' gap='4' mb='4'>
        <Flex direction='row' align='center' gap='4'>
          <Fieldset.Root>
            <Fieldset.Legend>
              <Text fontWeight='semibold'>Group By:</Text>
            </Fieldset.Legend>
            <Fieldset.Content>
              <CheckboxGroup>
                <Checkbox.Root
                  checked={groupByOptions.includes('status')}
                  onCheckedChange={() => toggleGroupByOption('status')}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>Status</Checkbox.Label>
                </Checkbox.Root>
                <Checkbox.Root
                  checked={groupByOptions.includes('group')}
                  onCheckedChange={() => toggleGroupByOption('group')}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>Group</Checkbox.Label>
                </Checkbox.Root>
              </CheckboxGroup>
            </Fieldset.Content>
          </Fieldset.Root>
        </Flex>

        {groupByOptions.length > 0 && (
          <Text fontSize='sm' color='fg.muted'>
            Active filters: {groupByOptions.join(', ')}
          </Text>
        )}
      </VStack>

      <StatusFilters filters={filters} onFiltersChange={handleFiltersChange} groups={groups} />

      {data && (
        <PageSection>
          {groupedEndpoints ? (
            <Accordion.Root multiple>
              {/* Status Grouping */}
              {groupByOptions.includes('status') &&
                Object.entries(groupedEndpoints).map(([status, groupOrItems]) => (
                  <Accordion.Item key={status} value={status}>
                    <Accordion.ItemTrigger>
                      <HStack>
                        {status === 'UP' ? (
                          <CheckCircle size={16} color='green' />
                        ) : (
                          <XCircle size={16} color='red' />
                        )}
                        <Text>{status} Endpoints</Text>
                        <Accordion.ItemIndicator />
                      </HStack>
                    </Accordion.ItemTrigger>

                    <Accordion.ItemContent>
                      <Accordion.ItemBody>
                        {/* If further grouped by group */}
                        {groupByOptions.includes('group') && typeof groupOrItems === 'object' ? (
                          <Accordion.Root multiple>
                            {Object.entries(groupOrItems).map(([group, items]) => (
                              <Accordion.Item key={group} value={group}>
                                <Accordion.ItemTrigger>
                                  <Badge variant='subtle'>{group}</Badge>
                                  <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <Accordion.ItemContent>
                                  <Accordion.ItemBody>
                                    <Grid
                                      templateColumns='repeat(auto-fill, minmax(280px, 1fr))'
                                      gap={2}
                                    >
                                      {(items as any[]).map(item => (
                                        <StatusCard key={item.endpoint.id} item={item} />
                                      ))}
                                    </Grid>
                                  </Accordion.ItemBody>
                                </Accordion.ItemContent>
                              </Accordion.Item>
                            ))}
                          </Accordion.Root>
                        ) : (
                          <Grid templateColumns='repeat(auto-fill, minmax(280px, 1fr))' gap={2}>
                            {Array.isArray(groupOrItems)
                              ? groupOrItems.map(item => (
                                  <StatusCard key={item.endpoint.id} item={item} />
                                ))
                              : Object.values(groupOrItems)
                                  .flat()
                                  .map((item: any) => (
                                    <StatusCard key={item.endpoint.id} item={item} />
                                  ))}
                          </Grid>
                        )}
                      </Accordion.ItemBody>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
            </Accordion.Root>
          ) : isMobile ? (
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
