import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Gauge } from 'lucide-react';
import { Button, Card, HStack, Text, VStack } from '@chakra-ui/react';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import { DateRangePicker } from '@/components/DateRangePicker';
import type { DateRange } from '@/components/DateRangePicker';
import { ComboboxSelect } from '@/components/common/ComboboxSelect';
import { StatusService } from '@/api/services/status.service';
import { ReportService } from '@/api/services/report.service';
import { HistoryService } from '@/api/services/history.service';
import { useAnalytics } from '@/hooks/useAnalytics';
import { toaster } from '@/components/ui/toaster';

export default function Reports() {
  const analytics = useAnalytics();

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const defaultRange = HistoryService.getDefaultDateRange();
    return { from: defaultRange.from, to: defaultRange.to };
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [downloadingReport, setDownloadingReport] = useState<
    'machine-availability' | 'executive-summary' | null
  >(null);

  useEffect(() => {
    analytics.trackPageView('Reports', { view_type: 'reports' });
  }, []);

  // Reuse the live-status feed just to build the group/floor filter options,
  // the same way Dashboard.tsx derives its group list — no dedicated groups endpoint exists yet.
  const { data: liveStatus } = useQuery({
    queryKey: ['reports-groups'],
    queryFn: () => StatusService.getLiveStatus({}),
  });

  const groupOptions = useMemo(() => {
    if (!liveStatus?.items) return [];
    const groupMap = new Map<string, { label: string; value: string }>();
    liveStatus.items.forEach(item => {
      const g = item.endpoint.group;
      if (g?.id) {
        groupMap.set(g.id, { label: g.name, value: g.id });
      }
    });
    return Array.from(groupMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [liveStatus?.items]);

  const reportParams = () => ({
    from: new Date(dateRange.from).toISOString(),
    to: new Date(dateRange.to).toISOString(),
    groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
  });

  const handleDownload = async (
    report: 'machine-availability' | 'executive-summary',
    label: string
  ) => {
    setDownloadingReport(report);
    try {
      const params = reportParams();
      if (report === 'machine-availability') {
        await ReportService.downloadMachineAvailability(params);
      } else {
        await ReportService.downloadExecutiveSummary(params);
      }
      analytics.trackFeatureUsage('Reports', 'download', { report });
    } catch (err) {
      console.error(`Failed to download ${report} report:`, err);
      toaster.create({
        type: 'error',
        title: `Couldn't download ${label}`,
        description: 'Check the selected date range and try again.',
      });
    } finally {
      setDownloadingReport(null);
    }
  };

  return (
    <Page
      title='Reports'
      description='Download machine health reports as Excel workbooks'
      testId='reports-page'
    >
      <PageSection>
        <HStack align='start' gap={4} flexWrap='wrap'>
          <VStack align='start' gap={1}>
            <Text fontSize='sm' fontWeight='medium'>
              Date Range
            </Text>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </VStack>
          <VStack align='start' gap={1}>
            <Text fontSize='sm' fontWeight='medium'>
              Group / Floor
            </Text>
            <ComboboxSelect
              items={groupOptions}
              selectedValue={selectedGroupIds}
              onChange={value =>
                setSelectedGroupIds(Array.isArray(value) ? value : value ? [value] : [])
              }
              isMulti
              placeholder='All groups'
              w='xs'
              size='xs'
            />
          </VStack>
        </HStack>
      </PageSection>

      <PageSection title='Available Reports' testId='report-cards'>
        <HStack align='stretch' gap={4} flexWrap='wrap'>
          <Card.Root flex='1' minW='sm' size='sm'>
            <Card.Header>
              <HStack gap={2}>
                <FileSpreadsheet size={20} />
                <Text fontWeight='medium'>Machine Availability Detail</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                One row per machine: status, uptime, response time, packet loss, last check and
                downtime for the selected period.
              </Text>
            </Card.Body>
            <Card.Footer>
              <Button
                size='sm'
                colorPalette='blue'
                onClick={() => void handleDownload('machine-availability', 'Machine Availability Detail')}
                loading={downloadingReport === 'machine-availability'}
              >
                <FileSpreadsheet size={16} />
                Download .xlsx
              </Button>
            </Card.Footer>
          </Card.Root>

          <Card.Root flex='1' minW='sm' size='sm'>
            <Card.Header>
              <HStack gap={2}>
                <Gauge size={20} />
                <Text fontWeight='medium'>Executive Health Summary</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                Org-wide uptime, outage and downtime totals for the period, plus a per-group
                breakdown.
              </Text>
            </Card.Body>
            <Card.Footer>
              <Button
                size='sm'
                colorPalette='blue'
                onClick={() => void handleDownload('executive-summary', 'Executive Health Summary')}
                loading={downloadingReport === 'executive-summary'}
              >
                <FileSpreadsheet size={16} />
                Download .xlsx
              </Button>
            </Card.Footer>
          </Card.Root>
        </HStack>
      </PageSection>
    </Page>
  );
}
