import { useMemo } from 'react';
import { Box, Text, VStack, Skeleton } from '@chakra-ui/react';
import type { RollupBucket, DailyBucket, RawCheck } from '@/api/types';
import type { BucketType } from '@/types/bucket';

export interface AvailabilityChartProps {
  data:
    | {
        raw: RawCheck[];
        rollup15m: RollupBucket[];
        rollupDaily: DailyBucket[];
      }
    | null
    | undefined;
  bucket: BucketType;
  height?: number;
  showResponseTime?: boolean;
  isLoading?: boolean;
}

export function AvailabilityChart({
  data,
  bucket,
  height = 300,
  isLoading,
}: AvailabilityChartProps) {
  if (isLoading) {
    return (
      <Box
        height={height}
        display='flex'
        alignItems='center'
        justifyContent='center'
        borderRadius='md'
        borderWidth='1px'
        bg='gray.50'
        _dark={{ bg: 'gray.800' }}
      >
        <VStack w='full' px={6} gap={4}>
          <Skeleton height='24px' width='40%' />
          <Skeleton height={`${height - 100}px`} width='100%' />
        </VStack>
      </Box>
    );
  }

  const chartData = useMemo(() => {
    if (!data) return null;
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

  if (chartData?.length === 0) {
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
  const minTime = Math.min(...(chartData?.map(d => d.timestamp) ?? []));
  const maxTime = Math.max(...(chartData?.map(d => d.timestamp) ?? []));
  const timeRange = maxTime - minTime || 1;

  const maxUptime = Math.max(...(chartData?.map(d => d.uptime) ?? []));
  const minUptime = Math.min(...(chartData?.map(d => d.uptime) ?? []));
  const uptimeRange = maxUptime - minUptime || 1;

  // Create path for area chart
  const createPath = () => {
    let path = '';
    chartData?.forEach((point, index) => {
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
    if ((chartData?.length ?? 0) > 0) {
      const lastX =
        (((chartData?.[chartData.length - 1]?.timestamp ?? minTime) - minTime) / timeRange) *
        chartWidth;
      const firstX = (((chartData?.[0]?.timestamp ?? minTime) - minTime) / timeRange) * chartWidth;
      path += ` L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
    }
    return path;
  };

  return (
    <Box height={'100%'} w='100%' position='relative'>
      <svg width='100%' height='100%'>
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
          {chartData?.map((point, index) => {
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
