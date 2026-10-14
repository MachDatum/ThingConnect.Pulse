import type { ReactNode } from 'react';
import { Badge, Box, Card, Grid, HStack, Skeleton, Spinner, Text, VStack } from '@chakra-ui/react';
import { Activity, AlertTriangle, Clock, Gauge, Radar, Timer } from 'lucide-react';
import type { AvailabilitySummary } from '@/api/services/report.service';
import { formatDuration, formatPct, uptimePalette } from './reportFormat';

const SKELETON_KEYS = ['uptime', 'downtime', 'events', 'mttr', 'rtt', 'coverage'];

interface ReportPreviewProps {
  summary: AvailabilitySummary | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  rangeLabel: string;
}

interface KpiProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  palette?: string;
}

function Kpi({ icon, label, value, hint, palette = 'gray' }: KpiProps) {
  return (
    <Box borderWidth='1px' borderRadius='lg' p={3} bg='bg.subtle' minW={0}>
      <HStack gap={1.5} color='fg.muted' mb={1}>
        {icon}
        <Text fontSize='xs' fontWeight='medium' textTransform='uppercase' letterSpacing='wide'>
          {label}
        </Text>
      </HStack>
      <Text
        fontSize='2xl'
        fontWeight='bold'
        lineHeight='short'
        color={palette === 'gray' ? 'fg' : `${palette}.fg`}
        truncate
      >
        {value}
      </Text>
      {hint && (
        <Text fontSize='xs' color='fg.muted' truncate>
          {hint}
        </Text>
      )}
    </Box>
  );
}

export function ReportPreview({
  summary,
  isLoading,
  isFetching,
  isError,
  rangeLabel,
}: ReportPreviewProps) {
  const overall = summary?.overall;
  const groups = [...(summary?.groups ?? [])].sort(
    (a, b) => (a.figures.uptimePct ?? 101) - (b.figures.uptimePct ?? 101)
  );

  return (
    <Card.Root size='sm' data-testid='report-preview'>
      <Card.Header>
        <HStack justify='space-between' align='start'>
          <VStack align='start' gap={0}>
            <Text fontWeight='semibold'>Preview</Text>
            <Text fontSize='sm' color='fg.muted'>
              {rangeLabel}
              {summary && ` · ${summary.endpointCount} endpoints`}
            </Text>
          </VStack>
          {isFetching && !isLoading && <Spinner size='sm' color='fg.muted' />}
        </HStack>
      </Card.Header>

      <Card.Body>
        {isError ? (
          <HStack color='fg.error' gap={2}>
            <AlertTriangle size={16} />
            <Text fontSize='sm'>Couldn't load the preview. The download may still work.</Text>
          </HStack>
        ) : isLoading || !overall ? (
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
            {SKELETON_KEYS.map(key => (
              <Skeleton key={key} h='20' borderRadius='lg' />
            ))}
          </Grid>
        ) : (
          <VStack align='stretch' gap={5}>
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
              <Kpi
                icon={<Activity size={14} />}
                label='Uptime'
                value={formatPct(overall.uptimePct)}
                hint={
                  summary.endpointsDown > 0
                    ? `${summary.endpointsDown} endpoint${summary.endpointsDown === 1 ? '' : 's'} down now`
                    : 'All endpoints up now'
                }
                palette={uptimePalette(overall.uptimePct)}
              />
              <Kpi
                icon={<Clock size={14} />}
                label='Avg downtime'
                value={formatDuration(
                  summary.avgDowntimeMinutesPerEndpoint == null
                    ? null
                    : summary.avgDowntimeMinutesPerEndpoint * 60
                )}
                hint={`Per endpoint · ${formatDuration(
                  overall.downtimeMinutes == null ? null : overall.downtimeMinutes * 60
                )} in total`}
              />
              <Kpi
                icon={<AlertTriangle size={14} />}
                label='Down events'
                value={overall.downEvents.toLocaleString()}
                hint={`${summary.endpointsWithOutage} endpoint${summary.endpointsWithOutage === 1 ? '' : 's'} affected`}
                palette={overall.downEvents > 0 ? 'orange' : 'gray'}
              />
              <Kpi
                icon={<Timer size={14} />}
                label='MTTR'
                value={formatDuration(overall.mttrSeconds)}
                hint={`Longest outage ${formatDuration(overall.longestOutageSeconds)}`}
              />
              <Kpi
                icon={<Gauge size={14} />}
                label='Avg response'
                value={overall.avgRttMs == null ? '—' : `${overall.avgRttMs.toFixed(1)} ms`}
                hint={`MTBF ${formatDuration(overall.mtbfSeconds)}`}
              />
              <Kpi
                icon={<Radar size={14} />}
                label='Coverage'
                value={formatPct(overall.coveragePct, 1)}
                hint='Of the period with monitoring data'
                palette={
                  overall.coveragePct != null && overall.coveragePct < 95 ? 'orange' : 'gray'
                }
              />
            </Grid>

            {groups.length > 0 && (
              <Box>
                <HStack justify='space-between' mb={2}>
                  <Text fontSize='sm' fontWeight='semibold'>
                    Uptime by group
                  </Text>
                  <Text fontSize='xs' color='fg.muted'>
                    Least available first
                  </Text>
                </HStack>
                <VStack align='stretch' gap={2} maxH='64' overflowY='auto' pr={1}>
                  {groups.map(g => {
                    const pct = g.figures.uptimePct;
                    const palette = uptimePalette(pct);
                    return (
                      <Box key={g.name}>
                        <HStack justify='space-between' gap={3} mb={1}>
                          <HStack gap={2} minW={0}>
                            <Text fontSize='sm' truncate>
                              {g.name}
                            </Text>
                            <Text fontSize='xs' color='fg.muted' flexShrink={0}>
                              {g.endpointCount}
                            </Text>
                          </HStack>
                          <HStack gap={2} flexShrink={0}>
                            {g.figures.downEvents > 0 && (
                              <Badge size='sm' colorPalette='orange' variant='subtle'>
                                {g.figures.downEvents} down
                              </Badge>
                            )}
                            <Text
                              fontSize='sm'
                              fontWeight='semibold'
                              color={palette === 'gray' ? 'fg.muted' : `${palette}.fg`}
                              minW='16'
                              textAlign='right'
                            >
                              {formatPct(pct)}
                            </Text>
                          </HStack>
                        </HStack>
                        <Box h='1.5' bg='bg.muted' borderRadius='full' overflow='hidden'>
                          <Box
                            h='full'
                            w={`${Math.max(0, Math.min(100, pct ?? 0))}%`}
                            bg={`${palette}.solid`}
                            borderRadius='full'
                            transition='width 0.3s ease'
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
