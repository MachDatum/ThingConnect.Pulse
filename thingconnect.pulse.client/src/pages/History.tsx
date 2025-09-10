import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Text,
  HStack,
  Button,
  Card,
  Grid,
  GridItem,
  Combobox,
  Portal,
  Span,
  Spinner,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { Download, TrendingUp, AlertCircle } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';

import { DateRangePicker } from '@/components/DateRangePicker';
import type { DateRange } from '@/components/DateRangePicker';
import { BucketSelector } from '@/components/BucketSelector';
import type { BucketType } from '@/types/bucket';
import { AvailabilityChart, AvailabilityStats } from '@/components/AvailabilityChart';
import { HistoryTable } from '@/components/HistoryTable';
import { HistoryService } from '@/api/services/history.service';
import { StatusService } from '@/api/services/status.service';

export default function History() {
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
  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<{
    label: string;
    value: string;
  }>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: contains,
  });

  // Update collection when liveData changes
  useEffect(() => {
    if (liveData?.items) {
      const items = liveData.items.map((item: any) => ({
        label: `${item.endpoint.name} (${item.endpoint.host})`,
        value: item.endpoint.id,
      }));
      set(items);

      // fallback only if not cleared manually
      if (!selectedEndpoint && items.length > 0 && !cleared) {
        setSelectedEndpoint(items[0].value);
      }
    }
  }, [liveData, set, selectedEndpoint, cleared]);

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
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['history', selectedEndpoint, dateRange, bucket],
    queryFn: () => {
      if (!selectedEndpoint) return null;

      return HistoryService.getEndpointHistory({
        id: selectedEndpoint,
        from: new Date(dateRange.from).toISOString(),
        to: new Date(dateRange.to).toISOString(),
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
      <PageSection title='Filters'>
        <Grid>
          <GridItem>
            <Text fontSize='sm' fontWeight='medium' mb={2}>
              Endpoint
            </Text>
            <Combobox.Root
              size='xs'
              w='full'
              collection={collection}
              value={selectedEndpoint ? [selectedEndpoint] : []}
              onValueChange={e => {
                setSelectedEndpoint(e.value[0] ?? '');
                setCleared(false);
              }}
              onInputValueChange={e => filter(e.inputValue)}
              onOpenChange={open => {
                if (open) {
                  filter('');
                }
              }}
              openOnClick
            >
              <Combobox.Control>
                <Combobox.Input placeholder='Select endpoint...' />
                <Combobox.IndicatorGroup>
                  <Combobox.ClearTrigger
                    onClick={() => {
                      setSelectedEndpoint('');
                      setCleared(true);
                    }}
                  />
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>

              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content minW='sm'>
                    {isLiveDataLoading ? (
                      <HStack p='2'>
                        <Spinner size='xs' borderWidth='1px' />
                        <Span>Loading endpoints...</Span>
                      </HStack>
                    ) : liveDataError ? (
                      <Span p='2' color='fg.error'>
                        Failed to load endpoints
                      </Span>
                    ) : collection.items.length === 0 ? (
                      <Combobox.Empty>No endpoints found</Combobox.Empty>
                    ) : (
                      collection.items.map(item => (
                        <Combobox.Item key={item.value} item={item}>
                          <HStack justify='space-between' textStyle='sm'>
                            {item.label}
                          </HStack>
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))
                    )}
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          </GridItem>
          <GridItem>
            <Text fontSize='sm' fontWeight='medium' mb={2}>
              Date Range
            </Text>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </GridItem>
          <GridItem>
            <Text fontSize='sm' fontWeight='medium' mb={2}>
              Data Granularity
            </Text>
            <BucketSelector value={bucket} onChange={setBucket} />
          </GridItem>
        </Grid>

        <HStack justify='flex-end' gap={3} mt={4}>
          <Button
            size='xs'
            variant='outline'
            onClick={() => {
              void refetch();
            }}
            disabled={isLoading || !selectedEndpoint}
          >
            Refresh
          </Button>
          <Button
            size='xs'
            colorPalette='blue'
            onClick={() => {
              void handleExportCSV();
            }}
            loading={isExporting}
            disabled={!historyData || isLoading}
          >
            <Download size={16} />
            Export CSV
          </Button>
        </HStack>
      </PageSection>

      {/* History Data */}
      {historyData && selectedEndpoint && (
        <>
          <PageSection title='Perfromance Summary' collapsible={true} testId='availability-stats'>
            <AvailabilityStats data={historyData} bucket={bucket} />
          </PageSection>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4}>
            {/* History BarChart */}
            <GridItem>
              <Card.Root>
                <Card.Header>
                  <HStack gap={2}>
                    <TrendingUp size={20} />
                    <Text fontWeight='medium' fontSize='sm'>
                      Availability Trend
                    </Text>
                  </HStack>
                </Card.Header>
                <Card.Body>
                  <AvailabilityChart data={historyData} bucket={bucket} height={300} />
                </Card.Body>
              </Card.Root>
            </GridItem>
          </Grid>
          {/* History Table */}
          <Card.Root>
            <Card.Header>
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
            <Card.Body>
              <HistoryTable data={historyData} bucket={bucket} pageSize={20} />
            </Card.Body>
          </Card.Root>
        </>
      )}
    </Page>
  );
}
