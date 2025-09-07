import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Text, HStack, Button, Card, Grid, GridItem } from '@chakra-ui/react';
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
  const [searchParams] = useSearchParams();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(
    searchParams.get('endpoint') || ''
  );
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const defaultRange = HistoryService.getDefaultDateRange();
    return {
      from: defaultRange.from.slice(0, 16), // Format for datetime-local input
      to: defaultRange.to.slice(0, 16),
    };
  });
  const [bucket, setBucket] = useState<BucketType>('15m');
  const [isExporting, setIsExporting] = useState(false);

  // Get list of endpoints for the dropdown
  const { data: liveData } = useQuery({
    queryKey: ['live-status'],
    queryFn: () => StatusService.getLiveStatus({ pageSize: 100 }),
    staleTime: 30000,
  });

  // If no endpoint selected, fallback to the first one from liveData
  useEffect(() => {
    if (liveData?.items?.length && !selectedEndpoint) {
      setSelectedEndpoint(liveData.items[0].endpoint.id);
    }
  }, [liveData, selectedEndpoint]);

  // Get historical data for selected endpoint
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
      {/* <PageHeader
        title="Historical Data"
        description="View historical monitoring data and export reports"
      /> */}
      <PageSection title='Filters'>
        <Card.Root>
          <Card.Body>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={4}
            >
              <GridItem>
                <Text fontSize='sm' fontWeight='medium' mb={2}>
                  Endpoint
                </Text>
                <select
                  value={selectedEndpoint}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedEndpoint(e.target.value)
                  }
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <option value=''>Select endpoint...</option>
                  {liveData?.items?.map(item => (
                    <option key={item.endpoint.id} value={item.endpoint.id}>
                      {item.endpoint.name} ({item.endpoint.host})
                    </option>
                  ))}
                </select>
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
                size='sm'
                variant='outline'
                onClick={() => {
                  void refetch();
                }}
                disabled={isLoading || !selectedEndpoint}
              >
                Refresh
              </Button>
              <Button
                size='sm'
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
          </Card.Body>
        </Card.Root>
      </PageSection>

      {historyData && selectedEndpoint && (
        <>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4}>
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

            <GridItem>
              <AvailabilityStats data={historyData} bucket={bucket} />
            </GridItem>
          </Grid>

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
