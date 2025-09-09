import { Box, Text, Grid, VStack, Heading, Flex, HStack, Card, Accordion } from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useStatusQuery } from '@/hooks/useStatusQuery';
import { StatusFilters } from '@/components/status/StatusFilters';
import { StatusTable } from '@/components/status/StatusTable';
import { StatusPagination } from '@/components/status/StatusPagination';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import type { LiveStatusParams } from '@/api/types';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import type { LiveStatusItem } from '@/api/types';

type GroupedEndpoints =
  | LiveStatusItem[]
  | Record<string, LiveStatusItem[]>
  | Record<string, Record<string, LiveStatusItem[]>>;

// Type guard to check if grouped endpoints is a record of LiveStatusItem arrays
function isGroupedByStatusAndGroup(
  endpoints: any
): endpoints is Record<string, Record<string, LiveStatusItem[]>> {
  return (
    typeof endpoints === 'object' &&
    !Array.isArray(endpoints) &&
    Object.values(endpoints).every(
      value =>
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.values(value as any).every(Array.isArray)
    )
  );
}

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
  const groupedEndpoints = useMemo<GroupedEndpoints | null>(() => {
    if (!data?.items) return null;

    // First, filter the items based on search term and group if applicable
    const filteredItems = data.items.filter(
      (e: LiveStatusItem) =>
        (!searchTerm ||
          e.endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.endpoint.host.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.group || e.endpoint.group.name === filters.group)
    );

    // If no group by options are selected, return a flat list of filtered items
    if (groupByOptions.length === 0) {
      return filteredItems;
    }

    // Determine the primary and secondary grouping options
    const isGroupByStatus = groupByOptions.includes('status');
    const isGroupByGroup = groupByOptions.includes('group');

    // Create a combined result to be returned
    let finalResult: Record<string, any> = {};

    if (isGroupByStatus && isGroupByGroup) {
      // Status → Group → Endpoints
      const statusBuckets: Record<'up' | 'down' | 'flapping', Record<string, LiveStatusItem[]>> = {
        up: {},
        down: {},
        flapping: {},
      };

      // Get unique groups from all endpoints
      const uniqueGroups = new Set(filteredItems.map(item => item.endpoint.group.name));

      // Prepare status buckets with all groups, even if empty
      const defaultStatuses: Array<'up' | 'down' | 'flapping'> = ['up', 'down', 'flapping'];
      defaultStatuses.forEach(status => {
        statusBuckets[status] = {};
        uniqueGroups.forEach(group => {
          statusBuckets[status][group] = [];
        });
      });

      // Populate the status buckets
      filteredItems.forEach(item => {
        const status = item.status;
        const group = item.endpoint.group.name;

        statusBuckets[status][group].push(item);
      });

      // Always include all statuses
      defaultStatuses.forEach(status => {
        finalResult[status] = statusBuckets[status];
      });
    } else if (isGroupByGroup) {
      // Group → Flat Endpoints
      const groupBuckets: Record<string, LiveStatusItem[]> = {};

      filteredItems.forEach(item => {
        const group = item.endpoint.group.name;

        if (!groupBuckets[group]) {
          groupBuckets[group] = [];
        }
        groupBuckets[group].push(item);
      });

      finalResult = groupBuckets;
    } else if (isGroupByStatus) {
      // Status → Endpoints
      const statusBuckets: Record<'up' | 'down' | 'flapping', LiveStatusItem[]> = {
        up: [],
        down: [],
        flapping: [],
      };

      filteredItems.forEach(item => {
        statusBuckets[item.status].push(item);
      });

      // Always include all statuses, even if empty
      const defaultStatuses: Array<'up' | 'down' | 'flapping'> = ['up', 'down', 'flapping'];
      defaultStatuses.forEach(status => {
        finalResult[status] = statusBuckets[status];
      });
    }

    // If no groups found, return filtered items
    return Object.keys(finalResult).length > 0 ? finalResult : filteredItems;
  }, [data?.items, groupByOptions, searchTerm, filters.group]);

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

  const handleToggleGroupBy = (option: string, isSelected: boolean) => {
    setGroupByOptions(prev => 
      isSelected 
        ? (prev.includes(option) ? prev : [...prev, option]) 
        : prev.filter(o => o !== option)
    );
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
      <StatusFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        groups={groups}
        groupByOptions={groupByOptions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onToggleGroupBy={handleToggleGroupBy}
      />

      {data && (
        <PageSection>
          {groupedEndpoints !== null ? (
            Array.isArray(groupedEndpoints) ? (
              <Box pb={4}>
                <StatusTable items={groupedEndpoints} isLoading={isLoading} />
              </Box>
            ) : isGroupedByStatusAndGroup(groupedEndpoints) ? (
              <Accordion.Root multiple variant='plain'>
                {Object.entries(groupedEndpoints).map(([status, groupItems]) => {
                  const totalEndpoints = Object.values(groupItems || {}).reduce(
                    (sum, group) => sum + (group?.length || 0),
                    0
                  );
                  const statusColorMap: Record<'up' | 'down' | 'flapping', string> = {
                    up: 'green',
                    down: 'red',
                    flapping: 'yellow',
                  } as const;

                  // Narrow the type for TypeScript
                  const typedGroupItems = groupItems || {};

                  return (
                    <Accordion.Item key={status} value={status} my={2}>
                      <Accordion.ItemTrigger
                        bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.100`}
                        _dark={{
                          bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.900`,
                          borderColor: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.800`,
                        }}
                        borderColor={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
                        borderWidth={1}
                      >
                        <HStack w='full' justify='space-between'>
                          <HStack px={'10px'}>
                            <Accordion.ItemIndicator
                              fontSize={'md'}
                              fontWeight={'bolder'}
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                            />
                            <Flex
                              as='span'
                              bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                              _dark={{ bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.700`, color: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.200` }}
                              textTransform='uppercase'
                              borderRadius='30px'
                              px={4}
                              py={1}
                              fontSize='11px'
                              alignItems='center'
                              justifyContent='center'
                              display='inline-flex'
                            >
                              {status}
                            </Flex>
                            <Text
                              fontSize='sm'
                              fontWeight='semibold'
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                            >
                              {totalEndpoints ? `${totalEndpoints} Endpoints` : 'No Endpoints'}
                            </Text>
                          </HStack>
                        </HStack>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent borderWidth={1} borderRadius={1}>
                        <Accordion.ItemBody py={0}>
                          <Accordion.Root multiple variant='plain' pl={4}>
                            {Object.entries(typedGroupItems).map(([group, items]) => (
                              <Accordion.Item key={group} value={group}>
                                <Accordion.ItemTrigger>
                                  <HStack w='full' justify='space-between'>
                                    <HStack px={'10px'}>
                                      <Accordion.ItemIndicator
                                        fontSize={'md'}
                                        fontWeight={'bolder'}
                                      />
                                      <Text fontSize='sm' fontWeight='semibold' pl={4}>
                                        {group}
                                      </Text>
                                      <Text fontSize='12px' color={'gray.400'} px={2}>
                                        {items?.length
                                          ? items?.length > 1
                                            ? `${items?.length} Endpoints`
                                            : '1 Endpoint'
                                          : 'No Endpoints'}
                                      </Text>
                                    </HStack>
                                  </HStack>
                                </Accordion.ItemTrigger>

                                <Accordion.ItemContent borderLeftWidth={1} borderRadius={2} ml={5}>
                                  <Accordion.ItemBody pl={6} py={0}>
                                    {items && items.length > 0 ? (
                                      <StatusTable items={items} isLoading={isLoading} />
                                    ) : (
                                      <Box
                                        textAlign='center'
                                        color='gray.500'
                                        py={8}
                                        borderRadius='md'
                                      >
                                        <Text>No endpoints available</Text>
                                      </Box>
                                    )}
                                  </Accordion.ItemBody>
                                </Accordion.ItemContent>
                              </Accordion.Item>
                            ))}
                          </Accordion.Root>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            ) : groupByOptions.includes('group') ? (
              <Accordion.Root multiple variant='plain'>
                {Object.entries(groupedEndpoints).map(([group, items]) => {
                  const typedItems = items as LiveStatusItem[] | Record<string, LiveStatusItem[]>;
                  const itemsArray = Array.isArray(typedItems)
                    ? typedItems
                    : Object.values(typedItems).flat();

                  return (
                    <Accordion.Item key={group} value={group} my={2}>
                      <Accordion.ItemTrigger borderWidth={1}>
                        <HStack w='full' justify='space-between'>
                          <HStack px={'10px'}>
                            <Accordion.ItemIndicator fontSize={'md'} fontWeight={'bolder'} />
                            <Text fontSize='sm' fontWeight='semibold' pl={4}>
                              {group}
                            </Text>
                            <Text fontSize='12px' color={'gray.400'} px={2}>
                              {items?.length
                                ? items?.length > 1
                                  ? `${items?.length} Endpoints`
                                  : '1 Endpoint'
                                : 'No Endpoints'}
                            </Text>
                          </HStack>
                        </HStack>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent borderWidth={1}>
                        <Accordion.ItemBody>
                          <Box pl={10}>
                            <StatusTable items={itemsArray} isLoading={isLoading} />
                          </Box>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            ) : groupByOptions.includes('status') ? (
              <Accordion.Root multiple variant='plain'>
                {Object.entries(groupedEndpoints).map(([status, items]) => {
                  const typedItems = items as LiveStatusItem[] | Record<string, LiveStatusItem[]>;
                  const itemsArray = Array.isArray(typedItems)
                    ? typedItems
                    : Object.values(typedItems).flat();

                  const statusColorMap: Record<'up' | 'down' | 'flapping', string> = {
                    up: 'green',
                    down: 'red',
                    flapping: 'yellow',
                  } as const;

                  return (
                    <Accordion.Item key={status} value={status} my={2}>
                      <Accordion.ItemTrigger
                        bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.100`}
                        _dark={{
                          bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.900`,
                          borderColor: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.800`,
                        }}
                        borderColor={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
                        borderWidth={1}
                      >
                        <HStack w='full' justify='space-between'>
                          <HStack px={'10px'}>
                            <Accordion.ItemIndicator
                              fontSize={'md'}
                              fontWeight={'bolder'}
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                            />
                            <Flex
                              as='span'
                              bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
                              textTransform='uppercase'
                              borderRadius='30px'
                              px={4}
                              py={1}
                              fontSize='11px'
                              alignItems='center'
                              justifyContent='center'
                              display='inline-flex'
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                              _dark={{ bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.700`, color: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.200` }}
                            >
                              {status}
                            </Flex>
                            <Text
                              fontSize='sm'
                              fontWeight='semibold'
                              color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                            >
                              {itemsArray?.length
                                ? itemsArray?.length > 1
                                  ? `${itemsArray?.length} Endpoints`
                                  : '1 Endpoint'
                                : 'No Endpoints'}
                            </Text>
                          </HStack>
                        </HStack>
                      </Accordion.ItemTrigger>

                      <Accordion.ItemContent borderWidth={1}>
                        <Accordion.ItemBody>
                          {itemsArray.length > 0 ? (
                            <Box pl={10}>
                              <StatusTable items={itemsArray} isLoading={isLoading} />
                            </Box>
                          ) : (
                            <Box textAlign='center' color='gray.500' py={8} borderRadius='md'>
                              <Text>No endpoints available</Text>
                            </Box>
                          )}
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            ) : (
              <StatusTable items={Object.values(groupedEndpoints).flat()} isLoading={isLoading} />
            )
          ) : (
            <StatusTable items={data.items} isLoading={isLoading} />
          )}

          {/* <StatusPagination
            meta={data.meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          /> */}
        </PageSection>
      )}
    </Page>
  );
}