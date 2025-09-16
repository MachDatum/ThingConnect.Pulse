import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useQuery } from '@tanstack/react-query';
import {
  Text,
  HStack,
  Button,
  Card,
  Combobox,
  Portal,
  Span,
  Spinner,
  useFilter,
  useListCollection,
  IconButton,
  VStack,
  Tabs,
  Skeleton,
} from '@chakra-ui/react';
import { Download, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';

import { DateRangePicker } from '@/components/DateRangePicker';
import type { DateRange } from '@/components/DateRangePicker';
import { BucketSelector } from '@/components/BucketSelector';
import type { BucketType } from '@/types/bucket';
import { AvailabilityChart } from '@/components/AvailabilityChart';
import { HistoryTable } from '@/components/HistoryTable';
import { HistoryService } from '@/api/services/history.service';
import { StatusService } from '@/api/services/status.service';
import { Tooltip } from '@/components/ui/tooltip';
import { AvailabilityStats } from '@/components/AvailabilityStats';
// import { EndpointCombobox } from '@/components/common/ComboboxSelect';

export default function History() {
  const analytics = useAnalytics();
  // State for filters
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(
    searchParams.get('endpoint') || ''
  );
  const [cleared, setCleared] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const defaultRange = HistoryService.getDefaultDateRange();
    return {
      from: defaultRange.from.slice(0, 16), // Format for datetime-local input
      to: defaultRange.to.slice(0, 16),
    };
  });
  const [bucket, setBucket] = useState<BucketType>('15m');
  const [isExporting, setIsExporting] = useState(false);

  // Live endpoints
  const {
    data: liveData,
    isLoading: isLiveDataLoading,
    error: liveDataError,
  } = useQuery({
    queryKey: ['live-status'],
    queryFn: () => StatusService.getLiveStatus({ pageSize: 100 }),
    staleTime: 30000,
  });

  // Filtering + collection for Combobox
  // const { contains } = useFilter({ sensitivity: 'base' });
  // const { collection, set, filter } = useListCollection<{
  //   label: string;
  //   value: string;
  // }>({
  //   initialItems: [],
  //   itemToString: item => item.label,
  //   itemToValue: item => item.value,
  //   filter: contains,
  // });

  // // Update collection when liveData changes
  // useEffect(() => {
  //   if (liveData?.items) {
  //     const items = liveData.items.map((item: any) => ({
  //       label: `${item.endpoint.name} (${item.endpoint.host})`,
  //       value: item.endpoint.id,
  //     }));
  //     set(items);

  //     // fallback only if not cleared manually
  //     if (!selectedEndpoint && items.length > 0 && !cleared) {
  //       setSelectedEndpoint(items[0].value);
  //     }
  //   }
  // }, [liveData, set, selectedEndpoint, cleared]);

  // Track page view
  useEffect(() => {
    analytics.trackPageView('History', {
      view_type: 'history_analysis',
      has_endpoint_filter: !!selectedEndpoint,
      date_range_days: Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)),
      bucket_granularity: bucket
    });
  }, []);

  // Sync endpoint to URL
  useEffect(() => {
    if (selectedEndpoint) {
      searchParams.set('endpoint', selectedEndpoint);
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.delete('endpoint');
      setSearchParams(searchParams, { replace: true });
    }
  }, [selectedEndpoint, searchParams, setSearchParams]);

  // History data for selected endpoint
  const {
    data: historyData,
    isLoading: isHistoryDataLoading,
    refetch,
    isRefetching: isHistoryDataRefetching,
  } = useQuery({
    queryKey: ['history', selectedEndpoint, dateRange, bucket],
    queryFn: () => {
      if (!selectedEndpoint) return null;
      const latestTo = new Date().toISOString();

      return HistoryService.getEndpointHistory({
        id: selectedEndpoint,
        from: new Date(dateRange.from).toISOString(),
        to: latestTo,
        bucket,
      });
    },
    enabled: !!selectedEndpoint,
    retry: 1,
  });
  const handleExportCSV = async () => {
    if (!selectedEndpoint) return;

    setIsExporting(true);
    try {
      await HistoryService.exportCSV({
        scope: 'endpoint',
        id: selectedEndpoint,
        from: new Date(dateRange.from).toISOString(),
        to: new Date(dateRange.to).toISOString(),
        bucket,
      });
    } catch (err) {
      console.error('Export failed:', err);
      // Could add toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const selectedEndpointName =
    liveData?.items?.find(item => item.endpoint.id === selectedEndpoint)?.endpoint?.name ||
    'Unknown Endpoint';

  return (
    <Page
      title='History'
      description='View historical monitoring data and export reports'
      testId='history-page'
    >
      <PageSection>
        <HStack align='start' gap={2} flexWrap='wrap'>
          <VStack align='start' gap={1}>
            <Text fontSize='sm' fontWeight='medium'>
              Endpoint
            </Text>
            <Skeleton loading={isLiveDataLoading} w='md'>

              {/* <EndpointCombobox 
                items={liveData?.items.map((item: any) => ({
                  label: `${item.endpoint.name} (${item.endpoint.host})`,
                  value: item.endpoint.id,
                })) || []}
                selectedValue={selectedEndpoint ? selectedEndpoint : ''}
                onChange={setSelectedEndpoint}
                isLoading={false}
                error={undefined}
                placeholder='Select endpoint...'
                optionName='Endpoints'
                defaultToFirst={true}
              /> */}
            </Skeleton>
          </VStack>
          <VStack align='start' gap={1}>
            <Text fontSize='sm' fontWeight='medium'>
              Date Range
            </Text>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </VStack>
          <VStack align='start' gap={1}>
            <Text fontSize='sm' fontWeight='medium'>
              Data Granularity
            </Text>
            <BucketSelector value={bucket} onChange={setBucket} />
          </VStack>
          <HStack mt={6} gap={2}>
            <Tooltip content='Refresh data'>
              <IconButton
                size='xs'
                variant='subtle'
                onClick={() => {
                  setDateRange(prev => ({
                    ...prev,
                    to: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16),
                  }));
                  void refetch();
                }}
                loading={isHistoryDataRefetching || isHistoryDataLoading}
                disabled={!selectedEndpoint}
              >
                <RefreshCw />
              </IconButton>
            </Tooltip>
            <Button
              size='xs'
              colorPalette='blue'
              onClick={() => void handleExportCSV()}
              loading={isExporting || isHistoryDataLoading || isLiveDataLoading}
              disabled={!historyData}
            >
              <Download size={16} />
              Export CSV
            </Button>
          </HStack>
        </HStack>
      </PageSection>
      {/* History Data */}
      <PageSection title='Performance Summary' testId='availability-stats'>
        <AvailabilityStats
          data={historyData}
          bucket={bucket}
          isLoading={isHistoryDataLoading || isLiveDataLoading}
        />
      </PageSection>
      <Tabs.Root
        defaultValue='chart'
        size='sm'
        h='full'
        display='flex'
        flexDirection='column'
        variant='enclosed'
        flex={1}
      >
        <Tabs.List display='flex' flexDirection='row' _dark={{ bg: 'gray.700' }}>
          <Tabs.Trigger value='chart'>Availability Chart</Tabs.Trigger>
          <Tabs.Trigger value='history'>Historical Data</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='chart' flex={1} display='flex' minH={0}>
          <Card.Root flex={1} display='flex' flexDirection='column' size={'sm'}>
            <Card.Header px={3} pt={3}>
              <HStack gap={2}>
                <TrendingUp size={20} />
                <Text fontWeight='medium' fontSize='sm'>
                  Availability Trend
                </Text>
                <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                  ({selectedEndpointName})
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body flex={1} minH={0} p={3}>
              <AvailabilityChart
                data={historyData}
                bucket={bucket}
                isLoading={isHistoryDataLoading || isLiveDataLoading}
              />
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
        <Tabs.Content value='history' flex={1} display='flex' minH={0}>
          <Card.Root flex={1} display='flex' flexDirection='column' overflow='hidden' size={'sm'}>
            <Card.Header px={3} pt={3}>
              <HStack gap={2}>
                <AlertCircle size={20} />
                <Text fontWeight='medium' fontSize='sm'>
                  Historical Data
                </Text>
                <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                  ({selectedEndpointName})
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body flex={1} display='flex' flexDirection='column' minH={0} p={3}>
              <HistoryTable
                data={historyData}
                bucket={bucket}
                pageSize={20}
                isLoading={isHistoryDataLoading || isLiveDataLoading}
              />
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Page>
  );
}
