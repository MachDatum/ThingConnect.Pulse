import { useMemo } from 'react';
import { Box, Text, VStack, Skeleton } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import type { HistoryResponse } from '@/api/types';
import type { BucketType } from '@/types/bucket';
import { CloudOff } from 'lucide-react';

export interface AvailabilityChartProps {
  data: HistoryResponse | null | undefined;
  bucket: BucketType;
  height?: number;
  showResponseTime?: boolean;
  isLoading?: boolean;
}

export function AvailabilityChart({ data, bucket, isLoading }: AvailabilityChartProps) {
  const chartData = useMemo(() => {
    if (!data) return null;
    switch (bucket) {
      case 'raw':
        return data.raw.map(check => ({
          xaxis: new Date(check.ts).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          yaxis: check.status === 'up' ? 100 : 0,
        }));
      case '15m':
        return data.rollup15m.map(bucket => ({
          xaxis: new Date(bucket.bucketTs).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          yaxis: bucket.upPct,
        }));
      case 'daily':
        return data.rollupDaily.map(bucket => ({
          xaxis: new Date(bucket.bucketDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          yaxis: bucket.upPct,
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
        <VStack gap={3}>
          <CloudOff size={32} color='#9CA3AF' />
          <Text color='gray.500' _dark={{ color: 'gray.400' }}>
            No data available for the selected time range
          </Text>
          <Text fontSize='sm' color='gray.400' _dark={{ color: 'gray.500' }}>
            Try adjusting your date range or check if monitoring is enabled for this endpoint
          </Text>
        </VStack>
      </Box>
    );
  }

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

  const margin = { top: 20, right: 30, bottom: 40, left: 70 };

  return (
    <Box flex={1} minH={0} w='full' h='full' position='relative'>
      <ParentSize>
        {({ width, height }) => {
          const xMax = width - margin.left - margin.right;
          const yMax = height - margin.top - margin.bottom;

          const xScale = scaleBand({
            range: [0, xMax],
            domain: chartData?.map(d => d.xaxis) ?? [],
            padding: 0.2,
          });

          const yScale = scaleLinear<number>({
            range: [yMax, 0],
            domain: [0, 100],
          });

          return (
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {chartData?.map((d, i) => {
                  const barWidth = xScale.bandwidth();
                  const barHeight = yMax - (yScale(d.yaxis) ?? 0);
                  const x = xScale(d.xaxis) ?? 0;
                  const y = yMax - barHeight;
                  return (
                    <rect
                      key={`bar-${i}`}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill='#3182ce'
                    />
                  );
                })}

                <AxisLeft
                  scale={yScale}
                  tickFormat={d => `${d}%`}
                  stroke='#718096'
                  tickStroke='transparent'
                  tickLabelProps={{
                    fill: '#718096',
                    fontSize: 10,
                    textAnchor: 'end',
                    dx: -4,
                  }}
                />

                {/* Y-axis label */}
                <text
                  x={-margin.left + 15}
                  y={yMax / 2}
                  // style={{ fontSize: '12px' }}
                  fill='#718096'
                  textAnchor='middle'
                  transform={`rotate(-90, ${-margin.left + 15}, ${yMax / 2})`}
                >
                  Uptime %
                </text>

                <AxisBottom
                  top={yMax}
                  scale={xScale}
                  stroke='#718096'
                  tickStroke='#718096'
                  tickFormat={() => ''}
                  tickLabelProps={{
                    fill: '#718096',
                    fontSize: 10,
                    textAnchor: 'middle',
                  }}
                />
              </Group>
            </svg>
          );
        }}
      </ParentSize>
    </Box>
  );
}
