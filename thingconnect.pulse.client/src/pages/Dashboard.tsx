import { VStack, Heading } from '@chakra-ui/react';
import { SystemOverviewStats } from '@/components/status/SystemOverviewStats';
import { useState, useMemo, useEffect } from 'react';
import { useStatusQuery } from '@/hooks/useStatusQuery';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { LiveStatusParams } from '@/api/types';
import type { LiveStatusItem } from '@/api/types';
import { EndpointFilters } from '@/components/status/EndpointFilters';
import { EndpointAccordion } from '@/components/status/EndpointAccordion';
import { useGroupsQuery } from '@/hooks/useGroupsQuery';

type GroupedEndpoints =
  | LiveStatusItem[]
  | Record<string, LiveStatusItem[]>
  | Record<string, Record<string, LiveStatusItem[]>>;

export default function Dashboard() {
  const analytics = useAnalytics();
  const [filters, setFilters] = useState<LiveStatusParams>({});
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const { data: groupsData = [] } = useGroupsQuery();

  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useStatusQuery({
    ...filters,
    search: searchTerm,
  });

  // Track page view and system metrics
  useEffect(() => {
    const startTime = performance.now();

    analytics.trackPageView('Dashboard', {
      view_type: 'main_dashboard',
      has_filters: Object.keys(filters).length > 0,
      has_search: searchTerm.length > 0,
      selected_group: selectedGroup,
    });

    return () => {
      const endTime = performance.now();
      analytics.trackPerformanceMetrics('Dashboard', {
        loadTime: endTime - startTime,
        dataFetchTime: isLoading ? endTime - startTime : 0,
      });
    };
  }, []);

  // Track system metrics when data loads
  useEffect(() => {
    if (data?.items) {
      const statusCounts = data.items.reduce(
        (acc, item) => {
          acc.total++;
          acc[item.status]++;
          return acc;
        },
        { total: 0, up: 0, down: 0, flapping: 0 }
      );

      analytics.trackSystemMetrics({
        totalEndpoints: statusCounts.total,
        activeAlerts: statusCounts.down + statusCounts.flapping,
        overallAvailability:
          statusCounts.total > 0 ? (statusCounts.up / statusCounts.total) * 100 : 0,
        monitoredServices: new Set(data.items.map(item => item.endpoint.host)).size,
        uptimePercentage: statusCounts.total > 0 ? (statusCounts.up / statusCounts.total) * 100 : 0,
      });
    }
  }, [data, analytics]);

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
        (!filters.group || e.endpoint.group.id === filters.group)
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

  const groups = useMemo(() => {
    return groupsData.sort((a, b) => a.name.localeCompare(b.name));
  }, [groupsData]);

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

  const handleFiltersChange = (newFilters: LiveStatusParams & { group?: string }) => {
    setFilters(newFilters);
    setSelectedGroup(newFilters.group);
  };

  const handleToggleGroupBy = (option: string, isSelected: boolean) => {
    setGroupByOptions(prev =>
      isSelected
        ? prev.includes(option)
          ? prev
          : [...prev, option]
        : prev.filter(o => o !== option)
    );
  };

  return (
    <Page
      title='Dashboard'
      testId='dashboard-page'
      description='Real-time monitoring of network endpoints'
    >
      <VStack align='stretch' gap='2' mb='2'>
        <Heading size='xl'>System Overview</Heading>
        <SystemOverviewStats statusCounts={statusCounts} />
      </VStack>
      <EndpointFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        groups={groups}
        groupByOptions={groupByOptions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onToggleGroupBy={handleToggleGroupBy}
        selectedGroup={selectedGroup}
        onSelectedGroupChange={setSelectedGroup}
      />
      <PageSection>
        <EndpointAccordion
          groupedEndpoints={groupedEndpoints}
          isLoading={isLoading}
          groupByOptions={groupByOptions}
        />
      </PageSection>
    </Page>
  );
}
