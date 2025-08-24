import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  HStack,
  SimpleGrid,
  Card,
  Stat,
  StatGroup,
  Button,
  Stack,
} from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { useParams, Link as RouterLink, Navigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ArrowLeft, Globe, Wifi, Activity, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { EndpointService } from '@/api/services/endpoint.service';
import { formatDistanceToNow } from 'date-fns';
import type { RawCheck, Outage } from '@/api/types';

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'up':
      return 'green';
    case 'down':
      return 'red';
    case 'flapping':
      return 'orange';
    default:
      return 'gray';
  }
}

function getEndpointTypeIcon(type: string) {
  switch (type) {
    case 'icmp':
      return <Wifi size={16} />;
    case 'tcp':
      return <Activity size={16} />;
    case 'http':
      return <Globe size={16} />;
    default:
      return <Server size={16} />;
  }
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return 'Unknown';

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

interface RecentChecksTableProps {
  checks: RawCheck[];
}

function RecentChecksTable({ checks }: RecentChecksTableProps) {
  if (checks.length === 0) {
    return (
      <Text color='gray.500' textAlign='center' py={8}>
        No recent checks available
      </Text>
    );
  }

  return (
    <VStack gap={2} align='stretch'>
      <HStack
        justify='space-between'
        px={2}
        py={1}
        bg='gray.50'
        _dark={{ bg: 'gray.800' }}
        rounded='md'
        fontSize='sm'
        fontWeight='medium'
      >
        <Text flex='1'>Time</Text>
        <Text w='16'>Status</Text>
        <Text w='20' textAlign='right'>
          RTT
        </Text>
        <Text flex='1' textAlign='right'>
          Error
        </Text>
      </HStack>
      {checks.slice(0, 10).map((check, index) => (
        <HStack
          key={`${check.ts}-${index}`}
          justify='space-between'
          px={2}
          py={2}
          borderBottom='1px'
          borderColor='gray.100'
          _dark={{ borderColor: 'gray.700' }}
        >
          <Text flex='1' fontSize='sm'>
            {formatDistanceToNow(new Date(check.ts), { addSuffix: true })}
          </Text>
          <Badge colorPalette={check.status === 'up' ? 'green' : 'red'} size='sm'>
            {check.status.toUpperCase()}
          </Badge>
          <Text w='20' textAlign='right' fontSize='sm'>
            {check.rttMs ? `${check.rttMs}ms` : '-'}
          </Text>
          <Text flex='1' textAlign='right' fontSize='sm' color='gray.500' lineClamp={1}>
            {check.error || '-'}
          </Text>
        </HStack>
      ))}
      {checks.length > 10 && (
        <Text fontSize='sm' color='gray.500' textAlign='center' pt={2}>
          Showing last 10 of {checks.length} checks
        </Text>
      )}
    </VStack>
  );
}

interface OutagesListProps {
  outages: Outage[];
}

function OutagesList({ outages }: OutagesListProps) {
  if (outages.length === 0) {
    return (
      <Text color='gray.500' textAlign='center' py={8}>
        No recent outages
      </Text>
    );
  }

  return (
    <VStack gap={4} align='stretch'>
      {outages.slice(0, 5).map((outage, index) => (
        <Card.Root key={`${outage.startedTs}-${index}`} variant='outline'>
          <Card.Body>
            <VStack gap={2} align='stretch'>
              <HStack justify='space-between'>
                <Text fontSize='sm' fontWeight='medium'>
                  {formatDistanceToNow(new Date(outage.startedTs), { addSuffix: true })}
                </Text>
                <Badge colorPalette={outage.endedTs ? 'gray' : 'red'} size='sm'>
                  {outage.endedTs ? 'Resolved' : 'Ongoing'}
                </Badge>
              </HStack>
              <HStack justify='space-between'>
                <Text fontSize='sm' color='gray.600'>
                  Duration: {formatDuration(outage.durationS)}
                </Text>
                {outage.endedTs && (
                  <Text fontSize='sm' color='gray.600'>
                    Ended: {formatDistanceToNow(new Date(outage.endedTs), { addSuffix: true })}
                  </Text>
                )}
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

export default function EndpointDetail() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to='/' replace />;
  }

  const {
    data: endpointDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => EndpointService.getEndpointDetail({ id, windowMinutes: 60 }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <VStack gap={6} align='stretch'>
        <HStack gap={3} align='center'>
          <ArrowLeft size={20} />
          <Text>Loading endpoint details...</Text>
        </HStack>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack gap={6} align='stretch'>
        <HStack gap={3} align='center'>
          <RouterLink to='/'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </RouterLink>
        </HStack>
        <Alert status='error'>
          <Box>
            <Text fontWeight='semibold'>Failed to load endpoint details</Text>
            <Text fontSize='sm' mt={1}>
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </Text>
          </Box>
        </Alert>
      </VStack>
    );
  }

  if (!endpointDetail) {
    return (
      <VStack gap={6} align='stretch'>
        <HStack gap={3} align='center'>
          <RouterLink to='/'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </RouterLink>
        </HStack>
        <Alert status='warning'>
          <Box>
            <Text fontWeight='semibold'>Endpoint not found</Text>
            <Text fontSize='sm' mt={1}>
              The endpoint with ID "{id}" was not found.
            </Text>
          </Box>
        </Alert>
      </VStack>
    );
  }

  const { endpoint, recent, outages } = endpointDetail;

  // Calculate uptime percentage from recent checks
  const upChecks = recent.filter(check => check.status === 'up').length;
  const uptimePercentage = recent.length > 0 ? Math.round((upChecks / recent.length) * 100) : 0;

  // Calculate average RTT
  const rttValues = recent.filter(check => check.rttMs != null).map(check => check.rttMs!);
  const avgRtt =
    rttValues.length > 0
      ? Math.round(rttValues.reduce((sum, rtt) => sum + rtt, 0) / rttValues.length)
      : null;

  // Get current status from most recent check
  const latestCheck = recent.length > 0 ? recent[0] : null;
  const currentStatus = latestCheck?.status || 'unknown';

  return (
    <VStack gap={6} align='stretch'>
      {/* Header with back button */}
      <HStack justify='space-between' align='center'>
        <RouterLink to='/'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </RouterLink>
      </HStack>

      {/* Endpoint overview */}
      <Card.Root>
        <Card.Body>
          <VStack gap={4} align='stretch'>
            <HStack justify='space-between' align='start'>
              <HStack gap={3} align='center'>
                {getEndpointTypeIcon(endpoint.type)}
                <Box>
                  <Heading size='lg'>{endpoint.name}</Heading>
                  <Text color='gray.600' _dark={{ color: 'gray.400' }}>
                    {endpoint.host}
                    {endpoint.port ? `:${endpoint.port}` : ''}
                    {endpoint.httpPath ? endpoint.httpPath : ''}
                  </Text>
                </Box>
              </HStack>
              <Badge colorPalette={getStatusColor(currentStatus)} size='lg'>
                {currentStatus.toUpperCase()}
              </Badge>
            </HStack>

            {/* Configuration details */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Box>
                <Text fontSize='sm' color='gray.500'>
                  Type
                </Text>
                <Text fontWeight='medium'>{endpoint.type.toUpperCase()}</Text>
              </Box>
              <Box>
                <Text fontSize='sm' color='gray.500'>
                  Interval
                </Text>
                <Text fontWeight='medium'>{endpoint.intervalSeconds}s</Text>
              </Box>
              <Box>
                <Text fontSize='sm' color='gray.500'>
                  Timeout
                </Text>
                <Text fontWeight='medium'>{endpoint.timeoutMs}ms</Text>
              </Box>
              <Box>
                <Text fontSize='sm' color='gray.500'>
                  Retries
                </Text>
                <Text fontWeight='medium'>{endpoint.retries}</Text>
              </Box>
            </SimpleGrid>

            {/* Group information */}
            <Box>
              <Text fontSize='sm' color='gray.500'>
                Group
              </Text>
              <HStack gap={2}>
                <Text fontWeight='medium'>{endpoint.group.name}</Text>
                {endpoint.group.color && (
                  <Box w={3} h={3} rounded='full' bg={endpoint.group.color} />
                )}
              </HStack>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Statistics */}
      <Card.Root>
        <Card.Body>
          <Heading size='md' mb={4}>
            Recent Performance
          </Heading>
          <StatGroup>
            <Stat.Root>
              <Stat.Label>Uptime (Last Hour)</Stat.Label>
              <Stat.ValueText>{uptimePercentage}%</Stat.ValueText>
              <Stat.HelpText>{recent.length} checks performed</Stat.HelpText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>Avg Response Time</Stat.Label>
              <Stat.ValueText>{avgRtt ? `${avgRtt}ms` : 'N/A'}</Stat.ValueText>
              <Stat.HelpText>{rttValues.length} successful checks</Stat.HelpText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>Active Outages</Stat.Label>
              <Stat.ValueText>{outages.filter(o => !o.endedTs).length}</Stat.ValueText>
              <Stat.HelpText>{outages.length} total outages</Stat.HelpText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>Last Check</Stat.Label>
              <Stat.ValueText fontSize='sm'>
                {latestCheck
                  ? formatDistanceToNow(new Date(latestCheck.ts), { addSuffix: true })
                  : 'N/A'}
              </Stat.ValueText>
              <Stat.HelpText>
                {latestCheck ? (latestCheck.rttMs ? `${latestCheck.rttMs}ms` : 'Failed') : ''}
              </Stat.HelpText>
            </Stat.Root>
          </StatGroup>
        </Card.Body>
      </Card.Root>

      {/* Recent Checks and Outages */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* Recent Checks */}
        <Card.Root>
          <Card.Body>
            <HStack justify='space-between' align='center' mb={4}>
              <Heading size='md'>Recent Checks</Heading>
              <Badge colorPalette='blue' variant='outline'>
                Last 60 minutes
              </Badge>
            </HStack>
            <RecentChecksTable checks={recent} />
          </Card.Body>
        </Card.Root>

        {/* Recent Outages */}
        <Card.Root>
          <Card.Body>
            <Heading size='md' mb={4}>
              Recent Outages
            </Heading>
            <OutagesList outages={outages} />
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Actions */}
      <Card.Root>
        <Card.Body>
          <Heading size='md' mb={4}>
            Actions
          </Heading>
          <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
            <RouterLink to={`/history?endpoint=${id}`}>
              <Button variant='outline'>
                <TrendingUp size={16} />
                View Full History
              </Button>
            </RouterLink>
            <Button variant='outline' disabled>
              <AlertCircle size={16} />
              Download Report
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
