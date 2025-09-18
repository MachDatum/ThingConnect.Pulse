import { useMemo } from 'react';
import {
  SimpleGrid,
  Stat,
  HStack,
  Badge,
  Icon,
  Skeleton,
  Box,
  VStack,
  Text,
} from '@chakra-ui/react';
import type { BucketType } from '@/types/bucket';
import { Database, CircleAlert } from 'lucide-react';
import type { AvailabilityChartProps } from '../AvailabilityChart';

export function AvailabilityStats({
  data,
  bucket,
  isLoading,
}: {
  data: AvailabilityChartProps['data'] | null | undefined;
  bucket: BucketType;
  isLoading?: boolean;
}) {
  const stats = useMemo(() => {
    if (!data) return null;

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
    let downEventPct = 0;
    if (totalPoints > 0) {
      if (bucket !== 'daily') downEventPct = (totalDownEvents / totalPoints) * 100;
      else downEventPct = totalDownEvents / totalPoints;
    }

    // Active outages
    const activeOutages = data?.outages.filter(o => !o.endedTs).length;

    return {
      availabilityPct,
      avgResponseTime,
      totalDownEvents,
      downEventPct,
      totalPoints,
      upPoints,
      totalOutages: data?.outages.length,
      activeOutages,
    };
  }, [data, bucket, data?.outages]);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} gap={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Stat.Root key={i} p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
            <Skeleton height='20px' mb={2} />
            <Skeleton height='28px' mb={1} />
            <Skeleton height='16px' />
          </Stat.Root>
        ))}
      </SimpleGrid>
    );
  }

  if (!stats) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            w='100%'
            h='100px'
            borderWidth='1px'
            rounded='md'
            display='flex'
            alignItems='center'
            justifyContent='center'
            bg='gray.50'
            _dark={{ bg: 'gray.800' }}
          >
            <VStack gap={1}>
              <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.300' }}>
                No historical data available
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 6 }} gap={2}>
      {/* Data Points */}
      <Stat.Root p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
        <HStack justify='space-between'>
          <Stat.Label>Data Points</Stat.Label>
          <Icon as={Database} color='fg.muted' boxSize={4} />
        </HStack>
        <Stat.ValueText>{stats.totalPoints}</Stat.ValueText>
        <Stat.HelpText>Checks included</Stat.HelpText>
      </Stat.Root>
      {/* Outages */}
      <Stat.Root p={3} borderWidth='1px' rounded='md' _dark={{ bg: 'gray.800' }}>
        <HStack justify='space-between'>
          <Stat.Label>Active Outages</Stat.Label>
        </HStack>
        <Stat.ValueText color={stats.activeOutages > 0 ? 'red.600' : 'green.600'}>
          {stats.activeOutages}
        </Stat.ValueText>
        <Stat.HelpText>{stats.totalOutages} total outages</Stat.HelpText>
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
