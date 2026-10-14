import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Download, Info } from 'lucide-react';
import { Box, Button, Card, Grid, HStack, Input, Separator, Text, VStack } from '@chakra-ui/react';
import { Page } from '@/components/layout/Page';
import { ComboboxSelect } from '@/components/common/ComboboxSelect';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatusService } from '@/api/services/status.service';
import {
  ReportService,
  availabilityReportFilename,
  type ReportInterval,
} from '@/api/services/report.service';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { WorkbookOutline } from '@/components/reports/WorkbookOutline';
import {
  MAX_DAYS,
  addDays,
  daysInclusive,
  formatRange,
  startOfWeek,
  toDateInput,
  today,
} from '@/components/reports/reportFormat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { toaster } from '@/components/ui/toaster';

const INTERVALS: { value: ReportInterval; label: string; unit: string }[] = [
  { value: 'hour', label: 'Hourly', unit: 'hour' },
  { value: 'day', label: 'Daily', unit: 'day' },
  { value: 'week', label: 'Weekly', unit: 'week' },
  { value: 'month', label: 'Monthly', unit: 'month' },
  { value: 'year', label: 'Yearly', unit: 'year' },
];

type Preset = { label: string; range: () => [Date, Date]; interval: ReportInterval };

// Each preset also picks the interval that reads best for that range.
const PRESETS: Preset[] = [
  { label: 'Today', range: () => [today(), today()], interval: 'hour' },
  {
    label: 'Yesterday',
    range: () => [addDays(today(), -1), addDays(today(), -1)],
    interval: 'hour',
  },
  { label: 'Last 7 days', range: () => [addDays(today(), -6), today()], interval: 'day' },
  { label: 'This week', range: () => [startOfWeek(today()), today()], interval: 'day' },
  {
    label: 'Last week',
    range: () => [addDays(startOfWeek(today()), -7), addDays(startOfWeek(today()), -1)],
    interval: 'day',
  },
  {
    label: 'This month',
    range: () => [new Date(today().getFullYear(), today().getMonth(), 1), today()],
    interval: 'day',
  },
  {
    label: 'Last month',
    range: () => [
      new Date(today().getFullYear(), today().getMonth() - 1, 1),
      new Date(today().getFullYear(), today().getMonth(), 0),
    ],
    interval: 'day',
  },
  { label: 'Last 3 months', range: () => [addDays(today(), -89), today()], interval: 'week' },
  {
    label: 'This year',
    range: () => [new Date(today().getFullYear(), 0, 1), today()],
    interval: 'month',
  },
];

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <VStack align='stretch' gap={2.5}>
      <HStack gap={2}>
        <Box
          boxSize='5'
          borderRadius='full'
          bg='blue.solid'
          color='blue.contrast'
          fontSize='xs'
          fontWeight='bold'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          {n}
        </Box>
        <Text fontSize='sm' fontWeight='semibold'>
          {title}
        </Text>
      </HStack>
      {children}
    </VStack>
  );
}

export default function Reports() {
  const analytics = useAnalytics();

  const [fromDate, setFromDate] = useState(() => toDateInput(addDays(today(), -6)));
  const [toDate, setToDate] = useState(() => toDateInput(today()));
  const [interval, setInterval] = useState<ReportInterval>('day');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    analytics.trackPageView('Reports', { view_type: 'reports' });
  }, []);

  // Reuse the live-status feed for the group filter and endpoint names, the same way Dashboard.tsx
  // derives its group list — no dedicated groups endpoint exists yet.
  const { data: liveStatus } = useQuery({
    queryKey: ['reports-groups'],
    queryFn: () => StatusService.getLiveStatus({}),
  });

  const groupOptions = useMemo(() => {
    const groupMap = new Map<string, { label: string; value: string }>();
    liveStatus?.items.forEach(item => {
      const g = item.endpoint.group;
      if (g?.id) groupMap.set(g.id, { label: g.name, value: g.id });
    });
    return Array.from(groupMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [liveStatus?.items]);

  const scopedEndpoints = useMemo(
    () =>
      (liveStatus?.items ?? [])
        .filter(
          item =>
            selectedGroupIds.length === 0 ||
            selectedGroupIds.includes(item.endpoint.group?.id ?? '')
        )
        .map(item => ({ name: item.endpoint.name, group: item.endpoint.group?.name ?? '' })),
    [liveStatus?.items, selectedGroupIds]
  );
  const endpointNames = scopedEndpoints.map(e => e.name);

  const days = fromDate && toDate ? daysInclusive(fromDate, toDate) : 0;
  const rangeValid = !!fromDate && !!toDate && days >= 1;
  const intervalTooFine = rangeValid && days > MAX_DAYS[interval];
  const canDownload = rangeValid && !intervalTooFine;
  const activePreset = PRESETS.find(p => {
    const [a, b] = p.range();
    return toDateInput(a) === fromDate && toDateInput(b) === toDate;
  });

  const summaryQuery = useQuery({
    queryKey: ['report-summary', fromDate, toDate, selectedGroupIds],
    queryFn: () =>
      ReportService.getAvailabilitySummary({
        from: fromDate,
        to: toDate,
        groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
      }),
    enabled: rangeValid && days <= MAX_DAYS.year,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const applyPreset = (preset: Preset) => {
    const [from, to] = preset.range();
    setFromDate(toDateInput(from));
    setToDate(toDateInput(to));
    setInterval(preset.interval);
  };

  const params = {
    from: fromDate,
    to: toDate,
    interval,
    groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await ReportService.downloadAvailability(params);
      analytics.trackFeatureUsage('Reports', 'download', {
        report: 'availability',
        interval,
        days,
      });
      toaster.create({
        type: 'success',
        title: 'Report downloaded',
        description: availabilityReportFilename(params),
      });
    } catch (err) {
      console.error('Failed to download availability report:', err);
      toaster.create({
        type: 'error',
        title: "Couldn't download the report",
        description: 'Check the selected period and try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedInterval = INTERVALS.find(i => i.value === interval)!;
  const periodCount = interval === 'hour' ? days * 24 : null;

  return (
    <Page
      title='Reports'
      description='Availability reports for your endpoints, exported as Excel workbooks'
      testId='reports-page'
    >
      <Grid
        templateColumns={{ base: '1fr', lg: '380px minmax(0, 1fr)' }}
        gap={6}
        alignItems='start'
      >
        {/* ── Settings ─────────────────────────────────────────────── */}
        <Card.Root
          size='sm'
          position={{ lg: 'sticky' }}
          top={{ lg: 4 }}
          data-testid='report-settings'
        >
          <Card.Header>
            <Text fontWeight='semibold'>Availability report</Text>
            <Text fontSize='sm' color='fg.muted'>
              Uptime, downtime, outages and response time per endpoint and group.
            </Text>
          </Card.Header>

          <Card.Body>
            <VStack align='stretch' gap={5}>
              <Step n={1} title='Period'>
                <HStack gap={1.5} flexWrap='wrap'>
                  {PRESETS.map(preset => (
                    <Button
                      key={preset.label}
                      size='xs'
                      variant={activePreset?.label === preset.label ? 'solid' : 'outline'}
                      colorPalette={activePreset?.label === preset.label ? 'blue' : 'gray'}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </HStack>
                <Grid templateColumns='1fr 1fr' gap={2}>
                  <VStack align='stretch' gap={1}>
                    <Text fontSize='xs' color='fg.muted'>
                      From
                    </Text>
                    <Input
                      type='date'
                      size='sm'
                      value={fromDate}
                      max={toDate || undefined}
                      onChange={e => setFromDate(e.target.value)}
                      aria-label='From date'
                    />
                  </VStack>
                  <VStack align='stretch' gap={1}>
                    <Text fontSize='xs' color='fg.muted'>
                      To
                    </Text>
                    <Input
                      type='date'
                      size='sm'
                      value={toDate}
                      min={fromDate || undefined}
                      max={toDateInput(today())}
                      onChange={e => setToDate(e.target.value)}
                      aria-label='To date'
                    />
                  </VStack>
                </Grid>
                <Text fontSize='xs' color={rangeValid ? 'fg.muted' : 'fg.error'}>
                  {rangeValid
                    ? `${formatRange(fromDate, toDate)} · ${days} ${days === 1 ? 'day' : 'days'}`
                    : 'The start date must be on or before the end date.'}
                </Text>
              </Step>

              <Separator />

              <Step n={2} title='Break down by'>
                <SegmentedControl
                  size='sm'
                  w='full'
                  value={interval}
                  onValueChange={e => e.value && setInterval(e.value as ReportInterval)}
                  items={INTERVALS.map(i => ({
                    value: i.value,
                    label: i.label,
                    disabled: rangeValid && days > MAX_DAYS[i.value],
                  }))}
                />
                <HStack gap={1.5} color={intervalTooFine ? 'fg.error' : 'fg.muted'} align='start'>
                  <Box pt='1px' flexShrink={0}>
                    <Info size={13} />
                  </Box>
                  <Text fontSize='xs'>
                    {intervalTooFine
                      ? `${selectedInterval.label} reports cover at most ${MAX_DAYS[interval]} days — shorten the period or pick a coarser breakdown.`
                      : interval === 'hour'
                        ? `${periodCount} hourly cells per endpoint, one sheet each (max ${MAX_DAYS.hour} days).`
                        : `A column block per ${selectedInterval.unit}, plus a Total.`}
                  </Text>
                </HStack>
              </Step>

              <Separator />

              <Step n={3} title='Endpoints'>
                <ComboboxSelect
                  items={groupOptions}
                  selectedValue={selectedGroupIds}
                  onChange={value =>
                    setSelectedGroupIds(Array.isArray(value) ? value : value ? [value] : [])
                  }
                  isMulti
                  placeholder='All groups'
                  w='full'
                  size='sm'
                />
                <Text fontSize='xs' color='fg.muted'>
                  {selectedGroupIds.length === 0
                    ? `All ${endpointNames.length} enabled endpoints`
                    : `${endpointNames.length} endpoints in ${selectedGroupIds.length} ${selectedGroupIds.length === 1 ? 'group' : 'groups'}`}
                </Text>
              </Step>
            </VStack>
          </Card.Body>

          <Card.Footer flexDirection='column' alignItems='stretch' gap={2}>
            <Button
              colorPalette='blue'
              onClick={() => void handleDownload()}
              loading={isDownloading}
              loadingText='Building workbook…'
              disabled={!canDownload}
              data-testid='download-report'
            >
              <Download size={16} />
              Download Excel report
            </Button>
            {canDownload && (
              <Text
                fontSize='xs'
                color='fg.muted'
                textAlign='center'
                truncate
                title={availabilityReportFilename(params)}
              >
                {availabilityReportFilename(params)}
              </Text>
            )}
          </Card.Footer>
        </Card.Root>

        {/* ── Preview ──────────────────────────────────────────────── */}
        <VStack align='stretch' gap={6} minW={0}>
          <ReportPreview
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            isFetching={summaryQuery.isFetching}
            isError={summaryQuery.isError}
            rangeLabel={rangeValid ? formatRange(fromDate, toDate) : 'Select a period'}
          />
          {rangeValid && (
            <WorkbookOutline
              from={fromDate}
              to={toDate}
              interval={interval}
              endpoints={scopedEndpoints}
            />
          )}
        </VStack>
      </Grid>
    </Page>
  );
}
