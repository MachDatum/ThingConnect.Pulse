import { Text, Badge, VStack, HStack, Timeline } from '@chakra-ui/react';
import { CloudOff } from 'lucide-react';
import { format } from 'date-fns';
import type { Outage } from '@/api/types';

interface OutagesTimelineProps {
  outages: Outage[] | undefined;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return 'Unknown';

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function OutagesTimeline({ outages }: OutagesTimelineProps) {
  if (outages?.length === 0) {
    return (
      <VStack
        justify='center'
        align='center'
        color='gray.300'
        textAlign='center'
        gap={1}
        py={5}
        h='100%'
      >
        <CloudOff size={'40px'} />
        <Text textAlign='center' color='gray.500'>
          No outages recorded
        </Text>
      </VStack>
    );
  }

  // Sort newest → oldest
  const sorted = [...(outages ?? [])].sort(
    (a, b) => new Date(b.startedTs).getTime() - new Date(a.startedTs).getTime()
  );

  return (
    <Timeline.Root>
      {sorted.map((outage, index) => (
        <Timeline.Item key={`${outage.startedTs}-${index}`} gap={1}>
          {/* Left side (start date) */}
          <Timeline.Content width='220px'>
            <Timeline.Title fontSize='sm' fontWeight='medium'>
              {format(new Date(outage.startedTs), 'PPpp')}
            </Timeline.Title>
          </Timeline.Content>

          {/* Connector with indicator */}
          <Timeline.Connector>
            <Timeline.Separator />
            <Timeline.Indicator colorPalette={outage.endedTs ? 'green' : 'red'}>
              {index + 1}
            </Timeline.Indicator>
          </Timeline.Connector>

          {/* Right side (details) */}
          <Timeline.Content ml={2}>
            <VStack align='stretch' gap={1}>
              {outage.endedTs && (
                <Text fontSize='xs'>Ended: {format(new Date(outage.endedTs), 'PPpp')}</Text>
              )}
              <HStack justify='flex-start'>
                <Badge colorPalette={outage.endedTs ? 'green' : 'red'} size='sm'>
                  {outage.endedTs ? 'Resolved' : 'Ongoing'}
                </Badge>
                <Text fontSize='xs'>Duration: {formatDuration(outage.durationS)}</Text>
              </HStack>

              {outage.lastError && (
                <Text fontSize='sm' color='red.600' _dark={{ color: 'red.400' }} lineClamp={2}>
                  {outage.lastError}
                </Text>
              )}
            </VStack>
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline.Root>
  );
}
