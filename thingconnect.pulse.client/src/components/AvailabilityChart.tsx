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
        height='100%'
        display='flex'
        alignItems='center'
        justifyContent='center'
        borderRadius='md'
        borderWidth='1px'
        bg='gray.50'
        _dark={{ bg: 'gray.800' }}
      >
        <VStack w='full' px={6} gap={4}>
          <Skeleton height='100%' width='100%' />
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
        }));
      case '15m':
        return data.rollup15m.map(bucket => ({
          timestamp: new Date(bucket.bucketTs).getTime(),
          displayTime: new Date(bucket.bucketTs).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          uptime: bucket.upPct,
        }));
      case 'daily':
        return data.rollupDaily.map(bucket => ({
          timestamp: new Date(bucket.bucketDate).getTime(),
          displayTime: new Date(bucket.bucketDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          uptime: bucket.upPct,
        }));
      default:
        return [];
    }
  }, [data, bucket]);

  if (chartData?.length === 0) {
    return (
      <Box
        height='100%'
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

  const margin = { top: 20, right: 30, bottom: 40, left: 70 };

  return (
    <Box w='full' h='full' position='relative'>
      <svg width='100%' height='100%' viewBox={`0 0 1000 ${height}`} preserveAspectRatio='none'>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid + Y-axis labels */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
            <g key={value}>
              <line
                x1={0}
                y1={
                  height -
                  margin.top -
                  margin.bottom -
                  (value / 100) * (height - margin.top - margin.bottom)
                }
                x2={1000 - margin.left - margin.right}
                y2={
                  height -
                  margin.top -
                  margin.bottom -
                  (value / 100) * (height - margin.top - margin.bottom)
                }
                stroke='#e2e8f0'
                strokeWidth='1'
                opacity='0.5'
              />
              <text
                x={-10}
                y={
                  height -
                  margin.top -
                  margin.bottom -
                  (value / 100) * (height - margin.top - margin.bottom) +
                  4
                }
                fill='#718096'
                textAnchor='end'
                style={{ fontSize: '10px' }}
              >
                {value}%
              </text>
            </g>
          ))}

          {/* Bars */}
          {chartData?.map((point, index) => {
            const chartWidth = 1000 - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;
            const slotWidth = chartWidth / chartData.length;
            const barWidth = slotWidth * 0.6;
            const x = index * slotWidth + (slotWidth - barWidth) / 2;
            const barHeight = (point.uptime / 100) * chartHeight;
            const y = chartHeight - barHeight;

            return (
              <rect
                key={`${point.timestamp}-${index}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill='#3182ce'
              />
            );
          })}

          {/* Y-axis label */}
          <text
            x={-35}
            y={(height - margin.top - margin.bottom) / 2.3}
            style={{ fontSize: '12' }}
            fill='#718096'
            textAnchor='middle'
            transform={`rotate(-90, -35, ${(height - margin.top - margin.bottom) / 2})`}
          >
            Uptime %
          </text>
        </g>
      </svg>
    </Box>
  );
}
