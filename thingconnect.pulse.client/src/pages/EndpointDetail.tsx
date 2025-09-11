import {
  Box,
  Text,
  VStack,
  Badge,
  HStack,
  SimpleGrid,
  Card,
  Stat,
  StatGroup,
  Button,
  Heading,
  Icon,
  Table,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  Wifi,
  Activity,
  Server,
  History,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Circle,
  Timer,
  Gauge,
  CircleCheckBig,
  CircleAlert,
  CloudOff,
} from 'lucide-react';
import { Page } from '@/components/layout/Page';
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

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'up':
      return ArrowUp;
    case 'down':
      return ArrowDown;
    case 'flapping':
      return AlertTriangle;
    default:
      return Circle;
  }
}

function getEndpointTypeIcon(type: string) {
  switch (type) {
    case 'icmp':
      return Wifi;
    case 'tcp':
      return Activity;
    case 'http':
      return Globe;
    default:
      return Server;
  }
}

function getEndpointTypeColor(type: string) {
  switch (type) {
    case 'icmp':
      return 'blue';
    case 'tcp':
      return 'purple';
    case 'http':
      return 'orange';
    default:
      return 'gray';
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
      <Table.Root size='sm'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w={'30%'}>Time</Table.ColumnHeader>
            <Table.ColumnHeader w={'20%'}>Status</Table.ColumnHeader>
            <Table.ColumnHeader w={'25%'}>RTT</Table.ColumnHeader>
            <Table.ColumnHeader w={'25%'}>Error</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {checks.slice(0, 10).map((check, index) => (
            <Table.Row key={`${check.ts}-${index}`}>
              <Table.Cell w={'30%'}>
                <Text flex='1' fontSize='sm'>
                  {formatDistanceToNow(new Date(check.ts), { addSuffix: true })}
                </Text>
              </Table.Cell>
              <Table.Cell w={'20%'}>
                <Badge colorPalette={check.status === 'up' ? 'green' : 'red'} size='sm'>
                  {check.status.toUpperCase()}
                </Badge>
              </Table.Cell>
              <Table.Cell w={'25%'}>
                <Text fontSize='sm'>{check.rttMs ? `${check.rttMs}ms` : '-'}</Text>
              </Table.Cell>
              <Table.Cell w={'25%'}>
                <Text flex='1' fontSize='sm' color='gray.500' lineClamp={1}>
                  {check.error || '-'}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
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
      <VStack color='gray.300' textAlign='center' gap={1} py={5}>
        <CloudOff size={'40px'} />
        <Text textAlign='center' color='gray.500'>
          No recent outages
        </Text>
      </VStack>
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

  if (!endpointDetail && !isLoading && !error) {
    return (
      <Page
        title='Endpoint Not Found'
        description={`The endpoint with ID "${id}" was not found`}
        actions={
          <RouterLink to='/'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </RouterLink>
        }
      >
        <Text>The endpoint with ID "{id}" was not found.</Text>
      </Page>
    );
  }

  if (!endpointDetail) return null;

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

  const backButton = (
    <RouterLink to='/'>
      <Button variant='ghost' size='sm' h='32px' mt={-4} mr={7}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Button>
    </RouterLink>
  );

  return (
    <Page
      title={endpoint.name}
      description={`${endpoint.type.toUpperCase()} endpoint monitoring`}
      actions={backButton}
    >
      <Card.Root>
        <Card.Body p={4}>
          <VStack gap={4} align='stretch'>
            <HStack justify='space-between' align='start' borderBottomWidth={1} pb={3}>
              <HStack gap={3} align='center'>
                <Box
                  bg={`${getEndpointTypeColor(endpoint.type)}.100`}
                  _dark={{
                    bg: `${getEndpointTypeColor(endpoint.type)}.800`,
                  }}
                  boxSize='12'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  borderRadius='full'
                >
                  <Icon
                    as={getEndpointTypeIcon(endpoint.type)}
                    color={`${getEndpointTypeColor(endpoint.type)}.600`}
                    _dark={{
                      color: `${getEndpointTypeColor(endpoint.type)}.200`,
                    }}
                    size={'2xl'}
                  />
                </Box>
                <Box>
                  <Heading size='lg'>{endpoint.name}</Heading>
                  <Text color='gray.600' _dark={{ color: 'gray.400' }} fontSize={'sm'}>
                    {endpoint.host}
                    {endpoint.port ? `:${endpoint.port}` : ''}
                    {endpoint.httpPath ? endpoint.httpPath : ''}
                  </Text>
                </Box>
              </HStack>
              <Box display={'flex'} gap={4} alignItems={'center'}>
                <Badge colorPalette={getStatusColor(currentStatus)} size='lg' rounded={7}>
                  <Icon as={getStatusIcon(currentStatus)} size={'sm'} />
                  {currentStatus.toUpperCase()}
                </Badge>
                <Box>
                  <RouterLink to={`/history?endpoint=${id}`}>
                    <Button variant='outline'>
                      <History size={16} />
                      View Full History
                    </Button>
                  </RouterLink>
                </Box>
              </Box>
            </HStack>

            {/* Configuration details */}
            <HStack justifyContent={'space-between'} px={14}>
              <Box pl={1}>
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
              <Box>
                <Text fontSize='sm' color='gray.500'>
                  Group
                </Text>
                <HStack gap={2} alignItems={'center'} justifyContent={'center'}>
                  <Text fontWeight='medium' color={'blue.600'} _dark={{ color: 'blue.400' }}>
                    {endpoint.group.name}
                  </Text>
                  <Box
                    w={3}
                    h={3}
                    mt={1}
                    rounded='full'
                    bg={endpoint.group.color ? `${endpoint.group.color}.600` : 'blue.600'}
                    _dark={{
                      bg: endpoint.group.color ? `${endpoint.group.color}.400` : 'blue.400',
                    }}
                  />
                </HStack>
              </Box>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Statistics */}
      <VStack w={'full'} align={'self-start'}>
        <Heading size='md'>Recent Performance</Heading>
        <StatGroup w={'full'} gap={2}>
          <Stat.Root borderWidth='1px' p='4' rounded='md' h={'full'} w={'25%'}>
            <HStack w={'full'} gap={3}>
              <Box
                bg={`green.100`}
                _dark={{
                  bg: `green.800`,
                }}
                boxSize='12'
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius='full'
              >
                <Icon color='green' _dark={{ color: 'green.400' }}>
                  <Timer />
                </Icon>
              </Box>
              <VStack align={'self-start'}>
                <Stat.Label>Uptime (Last Hour)</Stat.Label>
                <Stat.ValueText>{uptimePercentage}%</Stat.ValueText>
                <Stat.HelpText>{recent.length} checks performed</Stat.HelpText>
              </VStack>
            </HStack>
          </Stat.Root>

          <Stat.Root borderWidth='1px' p='4' rounded='md' h={'full'} w={'25%'}>
            <HStack w={'full'} gap={3}>
              <Box
                bg={`blue.100`}
                _dark={{
                  bg: `blue.800`,
                }}
                boxSize='12'
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius='full'
              >
                <Icon color='blue' _dark={{ color: 'blue.400' }}>
                  <Gauge />
                </Icon>
              </Box>
              <VStack align={'self-start'}>
                <Stat.Label>Avg Response Time</Stat.Label>
                <Stat.ValueText>{avgRtt ? `${avgRtt}ms` : 'N/A'}</Stat.ValueText>
                <Stat.HelpText>{rttValues.length} successful checks</Stat.HelpText>
              </VStack>
            </HStack>
          </Stat.Root>

          <Stat.Root borderWidth='1px' p='4' rounded='md' h={'full'} w={'25%'}>
            <HStack w={'full'} gap={3}>
              <Box
                bg={`yellow.100`}
                _dark={{
                  bg: `yellow.800`,
                }}
                boxSize='12'
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius='full'
              >
                <Icon color='yellow.400' _dark={{ color: 'yellow.400' }}>
                  <CircleAlert />
                </Icon>
              </Box>
              <VStack align={'self-start'}>
                <Stat.Label>Active Outages</Stat.Label>
                <Stat.ValueText>{outages.filter(o => !o.endedTs).length}</Stat.ValueText>
                <Stat.HelpText>{outages.length} total outages</Stat.HelpText>
              </VStack>
            </HStack>
          </Stat.Root>

          <Stat.Root borderWidth='1px' p='4' rounded='md' h={'full'} w={'25%'}>
            <HStack w={'full'} gap={3}>
              <Box
                bg={`purple.100`}
                _dark={{
                  bg: `purple.800`,
                }}
                boxSize='12'
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius='full'
              >
                <Icon color='purple' _dark={{ color: 'purple.400' }}>
                  <CircleCheckBig />
                </Icon>
              </Box>
              <VStack align={'self-start'}>
                <Stat.Label>Last Check</Stat.Label>
                <Stat.ValueText fontSize='sm'>
                  {latestCheck
                    ? formatDistanceToNow(new Date(latestCheck.ts), { addSuffix: true })
                    : 'N/A'}
                </Stat.ValueText>
                <Stat.HelpText>
                  {latestCheck ? (latestCheck.rttMs ? `${latestCheck.rttMs}ms` : 'Failed') : ''}
                </Stat.HelpText>
              </VStack>
            </HStack>
          </Stat.Root>
        </StatGroup>
      </VStack>

      {/* Recent Checks and Outages */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={2}>
        {/* Recent Checks */}
        <Card.Root>
          <Card.Header p={4} pb={0}>
            <HStack justify='space-between' align='center'>
              <Heading size='md'>Recent Checks</Heading>
              <Text color='blue' fontSize={'xs'}>
                Last 60 minutes
              </Text>
            </HStack>
          </Card.Header>
          <Card.Body p={4}>
            <RecentChecksTable checks={recent} />
          </Card.Body>
        </Card.Root>

        {/* Recent Outages */}
        <Card.Root>
          <Card.Header p={4} pb={0}>
            <Heading size='md'>Recent Outages</Heading>
          </Card.Header>
          <Card.Body p={4}>
            <OutagesList outages={outages} />
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Page>
  );
}
