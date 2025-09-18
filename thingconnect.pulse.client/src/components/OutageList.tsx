import { Text, VStack, Badge, HStack, Card } from '@chakra-ui/react';
import { CloudOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Outage } from '@/api/types';

interface OutagesListProps {
  outages: Outage[];
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return 'Unknown';

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function OutagesList({ outages }: OutagesListProps) {
  if (outages.length === 0) {
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
          No recent outages
        </Text>
      </VStack>
    );
  }

  function capitalizeFirstLetter(text: string) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  return (
    <VStack gap={4} align='stretch'>
      {outages.slice(0, 5).map((outage, index) => (
        <Card.Root key={`${outage.startedTs}-${index}`} size={'sm'}>
          <Card.Body p={3}>
            <VStack gap={2} align='stretch'>
              <HStack justify='space-between'>
                <Text fontSize='sm' fontWeight='medium'>
                  {capitalizeFirstLetter(
                    formatDistanceToNow(new Date(outage.startedTs), { addSuffix: true })
                  )}
                </Text>
                <Badge colorPalette={outage.endedTs ? 'green' : 'red'} size='sm'>
                  {outage.endedTs ? 'Resolved' : 'Ongoing'}
                </Badge>
              </HStack>
              <HStack justify='space-between'>
                <Text fontSize='sm' color='gray.600'>
                  Duration: {formatDuration(outage.durationS)}
                </Text>
                <Text fontSize='sm' color='gray.600'>
                  Ended:{' '}
                  {outage.endedTs
                    ? capitalizeFirstLetter(
                        formatDistanceToNow(new Date(outage.endedTs), { addSuffix: true })
                      )
                    : 'Unknown'}
                </Text>
              </HStack>
              {outage.lastError && (
                <Text fontSize='sm' color='red.600' _dark={{ color: 'red.400' }} lineClamp={2}>
                  {outage.lastError}
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
      {outages.length > 5 && (
        <Text fontSize='sm' color='gray.500' textAlign='center'>
          Showing 5 of {outages.length} recent outages
        </Text>
      )}
    </VStack>
  );
}
