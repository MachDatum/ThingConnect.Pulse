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
  SearchX,
} from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { useQuery } from '@tanstack/react-query';
import { EndpointService } from '@/api/services/endpoint.service';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { RecentChecksTable } from '@/components/RecentChecksTable';
import { OutagesList } from '@/components/OutageList';

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'up':
      return 'green';
    case 'down':
      return 'red';
    case 'flapping':
      return 'yellow';
    case 'service':
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
    case 'service':
      return Activity;
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

export default function EndpointDetail() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to='/' replace />;

  const {
    data: endpointDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => EndpointService.getEndpointDetail({ id, windowMinutes: 60 }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const backButton = (
    <RouterLink to='/'>
      <Button variant='ghost' size='sm' h='32px' mt={-4} mr={7}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Button>
    </RouterLink>
  );

  if (isLoading) {
    return (
      <Page title='Loading endpoint...' actions={backButton}>
        <VStack gap={4} align='stretch'>
          <Skeleton w='full' minH='150px' />
          <Heading size='md'>Recent Performance</Heading>
          <StatGroup w='full' gap={2}>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Stat.Root key={i} borderWidth='1px' p='4' rounded='md' h='full' w='25%'>
                  <HStack w='full' gap={3}>
                    <Skeleton boxSize='12' borderRadius='full' />
                    <VStack align='start' gap={1} w='full'>
                      <Skeleton minH='12px' w='60px' />
                      <Skeleton minH='16px' w='80px' />
                      <Skeleton minH='12px' w='100px' />
                    </VStack>
                  </HStack>
                </Stat.Root>
              ))}
          </StatGroup>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={2}>
            <Skeleton w='full' minH='50vh' />
            <Skeleton w='full' minH='50vh' />
          </SimpleGrid>
        </VStack>
      </Page>
    );
  }

  if (error || !endpointDetail) {
    return (
      <Page title='Endpoint Not Found' actions={backButton}>
        <EmptyState
          icon={<SearchX />}
          title='Endpoint Not Found'
          description={
            <>
              <Text>The endpoint with ID "{id}" does not exist.</Text>
              {error && (
                <Text color='red.500' mt={2} fontSize='sm'>
                  Error: {(error as Error).message}
                </Text>
              )}
            </>
          }
        />
      </Page>
    );
  }

  const { endpoint, recent, outages } = endpointDetail;

  // Calculate uptime percentage from recent checks
  const upChecks = recent.filter(check => check.currentState.status === 'up').length;
  const uptimePercentage = recent.length > 0 ? Math.round((upChecks / recent.length) * 100) : 0;

  // Calculate average RTT
  const rttValues = recent
    .filter(check => check.currentState.rttMs != null)
    .map(check => check.currentState.rttMs!);
  const avgRtt =
    rttValues.length > 0
      ? Math.round(rttValues.reduce((sum, rtt) => sum + rtt, 0) / rttValues.length)
      : null;

  // Get current status from most recent check
  const latestCheck = recent.length > 0 ? recent[0] : null;
  const currentStatus = latestCheck?.currentState.status || 'unknown';
  console.log(latestCheck?.currentState.rttMs);

  const stats = [
    {
      key: 'uptime',
      label: 'Uptime (Last Hour)',
      value: `${uptimePercentage}%`,
      help: `${recent.length} checks performed`,
      icon: Timer,
      color: 'green',
      bg: 'green',
    },
    {
      key: 'rtt',
      label: 'Avg Response Time',
      value: avgRtt ? `${avgRtt}ms` : 'N/A',
      help: `${rttValues.length} successful checks`,
      icon: Gauge,
      color: 'blue',
      bg: 'blue',
    },
    {
      key: 'outages',
      label: 'Active Outages',
      value: outages.filter(o => !o.endedTs).length,
      help: `${outages.length} total outages`,
      icon: CircleAlert,
      color: 'yellow.400',
      bg: 'yellow',
    },
    {
      key: 'lastCheck',
      label: 'Last Check',
      value: latestCheck
        ? formatDistanceToNow(new Date(latestCheck.ts), { addSuffix: true })
        : 'N/A',
      help: latestCheck ? `${latestCheck?.currentState.rttMs} ms` : '',
      icon: CircleCheckBig,
      color: 'purple',
      bg: 'purple',
    },
  ];

  return (
    <Page
      title={endpoint.name}
      description={
        <HStack gap={2}>
          <Text>{`${endpoint.type.toUpperCase()} endpoint monitoring`}</Text>
          <Badge fontSize='xs' colorPalette='blue'>
            Last 60 minutes
          </Badge>
        </HStack>
      }
      actions={backButton}
    >
      <Card.Root>
        <Card.Body p={3}>
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
      <VStack w='full' align='self-start'>
        <Heading size='md'>Recent Performance</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={2} w='full'>
          {stats.map(stat => (
            <Stat.Root key={stat.key} borderWidth='1px' p='3' rounded='md' h='full'>
              <HStack w='full' gap={3}>
                <Box
                  bg={`${stat.bg}.100`}
                  _dark={{ bg: `${stat.bg}.800` }}
                  boxSize='12'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  borderRadius='full'
                >
                  <Icon as={stat.icon} color={stat.color} _dark={{ color: `${stat.bg}.400` }} />
                </Box>
                <VStack align='self-start'>
                  <Stat.Label>{stat.label}</Stat.Label>
                  <Stat.ValueText fontSize={stat.key === 'lastCheck' ? 'sm' : undefined}>
                    {stat.value}
                  </Stat.ValueText>
                  <Stat.HelpText>{stat.help}</Stat.HelpText>
                </VStack>
              </HStack>
            </Stat.Root>
          ))}
        </SimpleGrid>
      </VStack>
      {/* Recent Checks and Outages */}
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} gap={2} w='full' h='full' overflow='auto'>
        {/* Recent Checks */}
        <Card.Root flex={1} display='flex' flexDirection='column' overflow='hidden' size={'sm'}>
          <Card.Header px={3} pt={3}>
            <Text fontWeight='medium' fontSize='sm'>
              Recent Checks
            </Text>
          </Card.Header>
          <Card.Body flex={1} display='flex' flexDirection='column' minH={0} p={3}>
            <RecentChecksTable checks={recent} pageSize={10} />
          </Card.Body>
        </Card.Root>

        {/* Recent Outages */}
        <Card.Root h='full' display='flex' flex={1} flexDirection='column'>
          <Card.Header p={3} pb={0}>
            <Text fontWeight='medium' fontSize='sm'>
              Recent Outages
            </Text>
          </Card.Header>
          <Card.Body flex={1} display='flex' flexDirection='column' minH={0} p={3}>
            <OutagesList outages={outages} isLoading={isLoading} />
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Page>
  );
}
