import { useMemo } from 'react';
import { Box, Text, VStack, Skeleton } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
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
    if (!data) return [];
    switch (bucket) {
      case 'raw':
        return data.raw.map(check => ({
          label: new Date(check.ts).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          uptime: check.currentState.status === 'up' ? 100 : 0,
        }));
      case '15m':
        return data.rollup15m.map(bucket => ({
          label: new Date(bucket.bucketTs).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          uptime: bucket.upPct,
        }));
      case 'daily':
        return data.rollupDaily.map(bucket => ({
          label: new Date(bucket.bucketDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          uptime: bucket.upPct,
        }));
      default:
        return [];
    }
  }, [data, bucket]);

  const chart = useChart({
    data: chartData,
    series: [{ name: 'uptime', color: 'blue.500' }],
  });

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

  return (
    <Chart.Root chart={chart} w='100%' h='100%'>
      <BarChart data={chart.data}>
        <CartesianGrid stroke={chart.color('border.muted')} vertical={false} />
        <XAxis axisLine={true} tickLine={false} dataKey={chart.key('label')} tick={false} />
        <YAxis
          label={{ value: 'Uptime %', angle: -90, position: 'insideLeft' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const uptime = payload[0].payload.uptime;
              return (
                <Box bg='gray.700' color='white' p={2} borderRadius='md'>
                  <Text fontSize='sm'>{`Time: ${label}`}</Text>
                  <Text fontSize='sm'>{`Uptime: ${uptime.toFixed(3)}%`}</Text>
                </Box>
              );
            }
            return null;
          }}
        />
        {chart.series.map(s => (
          <Bar key={s.name} dataKey={chart.key(s.name)} fill={chart.color(s.color)} />
        ))}
        <YAxis />
      </BarChart>
    </Chart.Root>
  );
}
