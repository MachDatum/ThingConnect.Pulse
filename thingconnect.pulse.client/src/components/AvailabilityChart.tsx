import { useMemo } from 'react';
import { Box, Text, VStack, SimpleGrid, Stat, HStack, Badge, Icon } from '@chakra-ui/react';
import type { RollupBucket, DailyBucket, RawCheck } from '@/api/types';
import type { BucketType } from '@/types/bucket';
import { Database } from 'lucide-react';

export interface AvailabilityChartProps {
  data: {
    raw: RawCheck[];
    rollup15m: RollupBucket[];
    rollupDaily: DailyBucket[];
  };
  bucket: BucketType;
  height?: number;
  showResponseTime?: boolean;
}

export function AvailabilityChart({ data, bucket, height = 300 }: AvailabilityChartProps) {
  const chartData = useMemo(() => {
    switch (bucket) {
      case 'raw':
        return data.raw.map(check => ({
          timestamp: new Date(check.ts).getTime(),
          displayTime: new Date(check.ts).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          uptime: check.status === 'up' ? 100 : 0,
          responseTime: check.rttMs || null,
          status: check.status,
          error: check.error,
        }));

      case '15m':
        return data.rollup15m.map(bucket => ({
          timestamp: new Date(bucket.bucketTs).getTime(),
          displayTime: new Date(bucket.bucketTs).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          uptime: bucket.upPct,
          responseTime: bucket.avgRttMs || null,
          downEvents: bucket.downEvents,
        }));

      case 'daily':
        return data.rollupDaily.map(bucket => ({
          timestamp: new Date(bucket.bucketDate).getTime(),
          displayTime: new Date(bucket.bucketDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          uptime: bucket.upPct,
          responseTime: bucket.avgRttMs || null,
          downEvents: bucket.downEvents,
        }));

      default:
        return [];
    }
  }, [data, bucket]);

  if (chartData.length === 0) {
    return (
      <Box
        height={height}
        display='flex'
        alignItems='center'
        justifyContent='center'
        bg='gray.50'
        _dark={{ bg: 'gray.800' }}
        borderRadius='md'
      >
        <VStack>
          <Text color='gray.500' _dark={{ color: 'gray.400' }}>
            No data available for the selected time range
          </Text>
          <Text fontSize='sm' color='gray.400' _dark={{ color: 'gray.500' }}>
            Try adjusting your date range or bucket selection
          </Text>
        </VStack>
      </Box>
    );
  }

  // Simple SVG chart implementation
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = 800 - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));
  const timeRange = maxTime - minTime || 1;

  const maxUptime = Math.max(...chartData.map(d => d.uptime));
  const minUptime = Math.min(...chartData.map(d => d.uptime));
  const uptimeRange = maxUptime - minUptime || 1;

  // Create path for area chart
  const createPath = () => {
    let path = '';
    chartData.forEach((point, index) => {
      const x = ((point.timestamp - minTime) / timeRange) * chartWidth;
      const y = chartHeight - ((point.uptime - minUptime) / uptimeRange) * chartHeight;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  // Create area path (includes bottom line)
  const createAreaPath = () => {
    let path = createPath();
    if (chartData.length > 0) {
      const lastX =
        ((chartData[chartData.length - 1].timestamp - minTime) / timeRange) * chartWidth;
      const firstX = ((chartData[0].timestamp - minTime) / timeRange) * chartWidth;
      path += ` L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
    }
    return path;
  };

  return (
    <Box height={height} position='relative'>
      <svg width='100%' height='100%' viewBox={`0 0 800 ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          <defs>
            <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path
                d='M 40 0 L 0 0 0 40'
                fill='none'
                stroke='#e2e8f0'
                strokeWidth='1'
                opacity='0.3'
              />
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill='url(#grid)' />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(value => (
            <g key={value}>
              <line
                x1={0}
                y1={chartHeight - (value / 100) * chartHeight}
                x2={chartWidth}
                y2={chartHeight - (value / 100) * chartHeight}
                stroke='#e2e8f0'
                strokeWidth='1'
                opacity='0.5'
              />
              <text
                x={-10}
                y={chartHeight - (value / 100) * chartHeight + 4}
                fontSize='12'
                fill='#718096'
                textAnchor='end'
              >
                {value}%
              </text>
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke='#718096'
            strokeWidth='2'
          />

          {/* Y-axis */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke='#718096' strokeWidth='2' />

          {/* Area chart */}
          <path
            d={createAreaPath()}
            fill='#3182ce'
            fillOpacity='0.3'
            stroke='#3182ce'
            strokeWidth='2'
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = ((point.timestamp - minTime) / timeRange) * chartWidth;
            const y = chartHeight - ((point.uptime - minUptime) / uptimeRange) * chartHeight;

            return (
              <circle
                key={`${point.timestamp}-${index}`}
                cx={x}
                cy={y}
                r='3'
                fill='#3182ce'
                stroke='white'
                strokeWidth='2'
              />
            );
          })}

          {/* Y-axis label */}
          <text
            x={-35}
            y={chartHeight / 2}
            fontSize='12'
            fill='#718096'
            textAnchor='middle'
            transform={`rotate(-90, -35, ${chartHeight / 2})`}
          >
            Uptime %
          </text>
        </g>
      </svg>
    </Box>
  );
}

export function AvailabilityStats({
  data,
  bucket,
}: {
  data: AvailabilityChartProps['data'];
  bucket: BucketType;
}) {
  const stats = useMemo(() => {
    let totalPoints = 0;
    let upPoints = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalDownEvents = 0;

    switch (bucket) {
      case 'raw': {
        totalPoints = data.raw.length;
        upPoints = data.raw.filter(check => check.status === 'up').length;
        const validRttChecks = data.raw.filter(check => check.rttMs != null);
        totalResponseTime = validRttChecks.reduce((sum, check) => sum + (check.rttMs || 0), 0);
        responseTimeCount = validRttChecks.length;
        break;
      }

      case '15m': {
        totalPoints = data.rollup15m.length;
        const totalUptime = data.rollup15m.reduce((sum, bucket) => sum + bucket.upPct, 0);
        upPoints = totalUptime / 100; // Convert percentage to equivalent "up points"
        totalDownEvents = data.rollup15m.reduce((sum, bucket) => sum + bucket.downEvents, 0);
        const validRttRollups = data.rollup15m.filter(bucket => bucket.avgRttMs != null);
        totalResponseTime = validRttRollups.reduce(
          (sum, bucket) => sum + (bucket.avgRttMs || 0),
          0
        );
        responseTimeCount = validRttRollups.length;
        break;
      }

      case 'daily': {
        totalPoints = data.rollupDaily.length;
        const totalDailyUptime = data.rollupDaily.reduce((sum, bucket) => sum + bucket.upPct, 0);
        upPoints = totalDailyUptime / 100; // Convert percentage to equivalent "up points"
        totalDownEvents = data.rollupDaily.reduce((sum, bucket) => sum + bucket.downEvents, 0);
        const validDailyRollups = data.rollupDaily.filter(bucket => bucket.avgRttMs != null);
        totalResponseTime = validDailyRollups.reduce(
          (sum, bucket) => sum + (bucket.avgRttMs || 0),
          0
        );
        responseTimeCount = validDailyRollups.length;
        break;
      }
    }

    const availabilityPct = totalPoints > 0 ? (upPoints / totalPoints) * 100 : 0;
    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : null;
    const downEventPct = totalPoints > 0 ? (totalDownEvents / totalPoints) * 100 : 0;
    // const downEventPct =
    //   totalPoints > 0
    //     ? totalDownEvents / totalPoints // average down events per bucket
    //     : 0;

    return {
      availabilityPct,
      avgResponseTime,
      totalDownEvents,
      downEventPct,
      totalPoints,
      upPoints,
    };
  }, [data, bucket]);

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} gap={2}>
      {/* Data Points */}
      <Stat.Root p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
        <HStack justify='space-between'>
          <Stat.Label>Data Points</Stat.Label>
          <Icon as={Database} color='fg.muted' boxSize={4} />
        </HStack>
        <Stat.ValueText>{stats.totalPoints}</Stat.ValueText>
        <Stat.HelpText>Checks included</Stat.HelpText>
      </Stat.Root>
      {/* Availability % */}
      <Stat.Root p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
        <Stat.Label>Availability</Stat.Label>
        <HStack>
          <Stat.ValueText
            color={
              stats.availabilityPct >= 99
                ? 'green.600'
                : stats.availabilityPct >= 95
                  ? 'yellow.600'
                  : 'red.600'
            }
          >
            {stats.availabilityPct.toFixed(2)}%
          </Stat.ValueText>
          {stats.availabilityPct >= 99 ? (
            <Stat.UpIndicator color='green.500' />
          ) : (
            <Stat.DownIndicator color={stats.availabilityPct >= 95 ? 'yellow.500' : 'red.500'} />
          )}
        </HStack>
        <Stat.HelpText>Based on {stats.totalPoints} checks</Stat.HelpText>
      </Stat.Root>
      {/* Uptime Events */}
      <Stat.Root p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
        <Stat.Label>Uptime Events</Stat.Label>
        <HStack>
          <Stat.ValueText color='green.600'>{Math.round(stats.upPoints)}</Stat.ValueText>
          <Badge colorPalette='green' gap='0'>
            <Stat.UpIndicator />
            {stats.availabilityPct.toFixed(2)}%
          </Badge>
        </HStack>
        <Stat.HelpText>Successful checks</Stat.HelpText>
      </Stat.Root>
      {/* Down Events */}
      {bucket !== 'raw' && (
        <Stat.Root p={2} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
          <Stat.Label>Down Events</Stat.Label>
          <HStack>
            <Stat.ValueText color={stats.totalDownEvents > 0 ? 'red.600' : 'green.600'}>
              {stats.totalDownEvents}
            </Stat.ValueText>
            <Badge colorPalette={stats.totalDownEvents > 0 ? 'red' : 'green'} gap='0'>
              <Stat.DownIndicator color={stats.totalDownEvents > 0 ? 'red' : 'green'} />
              {stats.downEventPct.toFixed(2)}%
            </Badge>
          </HStack>
          <Stat.HelpText>Recorded in this range</Stat.HelpText>
        </Stat.Root>
      )}
      {/* Response Time */}
      {stats.avgResponseTime && (
        <Stat.Root p={2} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
          <Stat.Label>Avg Response</Stat.Label>
          <Stat.ValueText alignItems='baseline'>
            {stats.avgResponseTime.toFixed(2)} <Stat.ValueUnit>ms</Stat.ValueUnit>
          </Stat.ValueText>
          <Stat.HelpText>Across successful checks</Stat.HelpText>
        </Stat.Root>
      )}
    </SimpleGrid>
  );
}
