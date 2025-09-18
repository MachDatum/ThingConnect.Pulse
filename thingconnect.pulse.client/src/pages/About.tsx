import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Grid,
  GridItem,
  Badge,
  Icon,
  Link,
  Button,
  Flex,
} from '@chakra-ui/react';
import {
  Heart,
  Shield,
  Zap,
  Settings,
  Smartphone,
  Linkedin,
  Instagram,
  MessageCircle,
  ExternalLink,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useForceRefreshNotifications, useNotificationStats } from '@/hooks/useNotifications';
import thingConnectLogo from '@/assets/thingconnect-logo.svg';

export default function About() {
  const { data: stats } = useNotificationStats();
  const refreshMutation = useForceRefreshNotifications();

  const handleRefreshNotifications = () => {
    refreshMutation.mutate();
  };

  return (
    <>
      <Flex direction='column' h='100vh'>
        <Flex flex='0 0 auto' px={6}>
          <PageHeader
            title='About'
            description='Free, on-premises availability monitoring for manufacturing IT/OT'
          />
        </Flex>
        <Box
          flex='1 1 auto'
          overflowY='auto'
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '4px',
              '&:hover': {
                background: 'gray.400',
              },
            },
          }}
          mb={8}
        >
          {/* Hero Section */}
          <Box bg='gray.50' _dark={{ bg: 'gray.900' }} py={6}>
            <Container maxW='5xl'>
              <VStack gap={4} textAlign='center'>
                <Heading size='3xl' color='gray.800' _dark={{ color: 'white' }}>
                  The Heart of Manufacturing Connection
                </Heading>
                <Text fontSize='lg' color='gray.600' _dark={{ color: 'gray.300' }} maxW='3xl'>
                  At ThingConnect, we help manufacturing teams connect, monitor, and optimize their
                  IT/OT infrastructure with ease.
                </Text>
                <HStack justify='center' gap={3}>
                  <Image src={thingConnectLogo} alt='ThingConnect' h='50px' />
                  <HStack gap={2}>
                    <Badge colorPalette='blue' variant='solid' size='sm'>
                      v1.0.0
                    </Badge>
                    <Badge variant='outline' size='sm'>
                      Network Monitor
                    </Badge>
                  </HStack>
                </HStack>
                <Box
                  p={4}
                  borderRadius='lg'
                  bg='gray.50'
                  _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                  border='1px solid'
                  borderColor='gray.200'
                >
                  <Text
                    fontSize='md'
                    lineHeight='1.7'
                    color='gray.700'
                    _dark={{ color: 'gray.300' }}
                  >
                    ThingConnect Pulse provides YAML-configured monitoring with live dashboard,
                    historical rollups, and CSV export. Designed for plant IT/OT admins, production
                    supervisors, and maintenance engineers who need reliable network device
                    monitoring with zero external dependencies.
                  </Text>
                </Box>
              </VStack>
            </Container>
          </Box>

          {/* Community Section */}
          <Box py={8}>
            <Container maxW='6xl'>
              <VStack gap={8} textAlign='center'>
                <Heading size='2xl' color='gray.800' _dark={{ color: 'white' }}>
                  Join Our Community
                </Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  {[
                    {
                      icon: MessageCircle,
                      title: 'Discord',
                      desc: 'Community support and real-time help',
                      tags: ['Community Support', 'Q&A', 'General Chat', 'Networking'],
                      link: 'https://discord.gg',
                    },
                    {
                      icon: MessageCircle,
                      title: 'Reddit',
                      desc: 'Share questions and experiences',
                      tags: ['Discussions', 'Tips', 'Troubleshooting'],
                      link: 'https://reddit.com',
                    },
                    {
                      icon: Linkedin,
                      title: 'LinkedIn',
                      desc: 'Professional community for industry leaders',
                      tags: ['Networking', 'Hiring', 'Case Studies'],
                      link: 'https://linkedin.com',
                    },
                    {
                      icon: Instagram,
                      title: 'Instagram',
                      desc: 'Stories, highlights, and community moments',
                      tags: ['Updates', 'Events', 'Highlights'],
                      link: 'https://instagram.com',
                    },
                  ].map((c, i) => (
                    <Link key={i} href={c.link} target='_blank' _hover={{ textDecoration: 'none' }}>
                      <VStack
                        align='start'
                        p={4}
                        border='1px solid'
                        borderColor='gray.200'
                        _dark={{ borderColor: 'gray.700', bg: 'gray.800' }}
                        bg='white'
                        borderRadius='lg'
                        shadow='md'
                        transition='all 0.2s'
                        _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                        h='100%'
                        w={'full'}
                      >
                        <HStack gap={3}>
                          <Icon as={c.icon} boxSize={6} color='blue.500' />
                          <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                            {c.title}
                          </Heading>
                        </HStack>
                        <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.300' }}>
                          {c.desc}
                        </Text>
                        <HStack wrap='wrap' gap={2} pt={2}>
                          {c.tags.map((tag, j) => (
                            <Badge key={j} variant='subtle' colorPalette='blue'>
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    </Link>
                  ))}
                </Grid>
              </VStack>
            </Container>
          </Box>

          {/* Mission Section */}
          <Box py={8}>
            <Container maxW='5xl'>
              <VStack gap={4} textAlign='center'>
                <Heading size='2xl' color='gray.800' _dark={{ color: 'white' }}>
                  Our Mission
                </Heading>
                <Text fontSize='lg' color='gray.600' _dark={{ color: 'gray.300' }} maxW='3xl'>
                  One platform for limitless industrial monitoring. From network devices to
                  production lines – all in one local-first solution.
                </Text>
              </VStack>
            </Container>
          </Box>

          {/* Features Section */}
          <Box bg='blue.50' _dark={{ bg: 'blue.900' }} py={8}>
            <Container maxW='6xl'>
              <VStack gap={8}>
                <Heading size='2xl' textAlign='center' color='gray.800' _dark={{ color: 'white' }}>
                  Key Features
                </Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  {[
                    {
                      icon: <Zap size={20} color='#3182ce' />,
                      title: 'Lightweight Setup',
                      desc: '5-minute installation with single Windows Service installer.',
                    },
                    {
                      icon: <Shield size={20} color='#38a169' />,
                      title: 'Local-First Architecture',
                      desc: 'All data stays on-premises with no cloud dependencies.',
                    },
                    {
                      icon: <Settings size={20} color='#d69e2e' />,
                      title: 'Readable Configuration',
                      desc: 'Simple YAML configuration with explicit Apply workflow.',
                    },
                    {
                      icon: <Smartphone size={20} color='#805ad5' />,
                      title: 'Mobile-Friendly Dashboard',
                      desc: 'Responsive interface optimized for tablets and phones.',
                    },
                  ].map((f, i) => (
                    <GridItem key={i}>
                      <VStack
                        align='start'
                        p={4}
                        borderRadius='lg'
                        border='1px solid'
                        borderColor='gray.200'
                        _dark={{ borderColor: 'gray.600', bg: 'gray.800' }}
                        bg='white'
                        shadow='sm'
                      >
                        <HStack gap={3}>
                          <Box p={2} borderRadius='md' bg='gray.50' _dark={{ bg: 'gray.700' }}>
                            {f.icon}
                          </Box>
                          <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                            {f.title}
                          </Heading>
                        </HStack>
                        <Text color='gray.600' _dark={{ color: 'gray.300' }}>
                          {f.desc}
                        </Text>
                      </VStack>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </Container>
          </Box>

          {/* Technology Stack */}
          <Box py={8}>
            <Container maxW='5xl'>
              <VStack gap={4} textAlign='center'>
                <Heading size='2xl' color='gray.800' _dark={{ color: 'white' }}>
                  Built with Modern Tech
                </Heading>
                <HStack wrap='wrap' justify='center' gap={3}>
                  {[
                    'ASP.NET Core 8.0',
                    'React 19',
                    'TypeScript',
                    'Chakra UI',
                    'Entity Framework',
                    'SQLite',
                    'Windows Service',
                  ].map((tech, i) => (
                    <Badge
                      key={i}
                      variant='subtle'
                      colorPalette='blue'
                      px={4}
                      py={2}
                      borderRadius='full'
                    >
                      {tech}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </Container>
          </Box>

          {/* Notification System */}
          <Box py={8}>
            <Container maxW='5xl'>
              <VStack gap={6}>
                <Heading size='2xl' textAlign='center' color='gray.800' _dark={{ color: 'white' }}>
                  Notification System
                </Heading>

                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} w='full'>
                  {/* Stats Card */}
                  <VStack
                    align='stretch'
                    p={6}
                    borderRadius='lg'
                    border='1px solid'
                    borderColor='gray.200'
                    _dark={{ borderColor: 'gray.600', bg: 'gray.800' }}
                    bg='white'
                    shadow='sm'
                  >
                    <HStack gap={3} mb={4}>
                      <Box p={2} borderRadius='md' bg='blue.50' _dark={{ bg: 'blue.900' }}>
                        <Bell size={20} color='#3182ce' />
                      </Box>
                      <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                        Notification Status
                      </Heading>
                    </HStack>

                    <VStack align='stretch' gap={3}>
                      <HStack justifyContent='space-between'>
                        <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                          Active Notifications:
                        </Text>
                        <Badge variant='outline' colorPalette='blue'>
                          {stats?.activeNotifications || 0}
                        </Badge>
                      </HStack>

                      <HStack justifyContent='space-between'>
                        <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                          Unread Count:
                        </Text>
                        <Badge variant='solid' colorPalette={stats?.unreadNotifications ? 'red' : 'gray'}>
                          {stats?.unreadNotifications || 0}
                        </Badge>
                      </HStack>

                      <HStack justifyContent='space-between'>
                        <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                          Last Sync:
                        </Text>
                        <Text fontSize='sm' color='gray.700' _dark={{ color: 'gray.300' }}>
                          {stats?.lastFetch ? new Date(stats.lastFetch).toLocaleDateString() : 'Never'}
                        </Text>
                      </HStack>

                      <HStack justifyContent='space-between'>
                        <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                          Sync Status:
                        </Text>
                        <Badge
                          variant='solid'
                          colorPalette={stats?.lastFetchSuccess ? 'green' : 'red'}
                        >
                          {stats?.lastFetchSuccess ? 'Success' : 'Failed'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>

                  {/* Control Card */}
                  <VStack
                    align='stretch'
                    p={6}
                    borderRadius='lg'
                    border='1px solid'
                    borderColor='gray.200'
                    _dark={{ borderColor: 'gray.600', bg: 'gray.800' }}
                    bg='white'
                    shadow='sm'
                  >
                    <HStack gap={3} mb={4}>
                      <Box p={2} borderRadius='md' bg='green.50' _dark={{ bg: 'green.900' }}>
                        <RefreshCw size={20} color='#38a169' />
                      </Box>
                      <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                        Manual Sync
                      </Heading>
                    </HStack>

                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} mb={4}>
                      Notifications are automatically synced every 6 hours. Use the button below to trigger an immediate refresh.
                    </Text>

                    <VStack align='stretch' gap={3}>
                      <Button
                        onClick={handleRefreshNotifications}
                        loading={refreshMutation.isPending}
                        loadingText='Syncing...'
                        colorPalette='blue'
                        size='md'
                      >
                        <RefreshCw size={16} />
                        Refresh Notifications
                      </Button>

                      {refreshMutation.isSuccess && (
                        <Text fontSize='sm' color='green.600' _dark={{ color: 'green.400' }} textAlign='center'>
                          Notifications refreshed successfully!
                        </Text>
                      )}

                      {refreshMutation.isError && (
                        <Text fontSize='sm' color='red.600' _dark={{ color: 'red.400' }} textAlign='center'>
                          Failed to refresh notifications. Please try again.
                        </Text>
                      )}

                      <Text fontSize='xs' color='gray.500' _dark={{ color: 'gray.500' }} textAlign='center'>
                        Syncs from: thingconnect-pulse.s3.ap-south-1.amazonaws.com
                      </Text>
                    </VStack>
                  </VStack>
                </Grid>
              </VStack>
            </Container>
          </Box>

          {/* Footer Section */}
          <Box py={6}>
            <Container maxW='4xl'>
              <VStack gap={3} textAlign='center'>
                <HStack justify='center' gap={2}>
                  <Heart size={18} color='red' />
                  <Text fontWeight='medium' fontSize='sm'>
                    Powered by ThingConnect
                  </Text>
                </HStack>
                <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }} maxW='3xl'>
                  ThingConnect specializes in manufacturing connectivity solutions, helping plants
                  optimize their industrial networks and data infrastructure.
                </Text>
                <HStack gap={4} justify='center'>
                  <Link
                    href='https://thingconnect.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Button size='sm' variant='outline'>
                      <ExternalLink size={14} />
                      Visit ThingConnect.io
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </Container>
          </Box>

          {/* License Footer */}
          <Box
            py={6}
            bg='green.50'
            _dark={{ bg: 'green.900', color: 'green.200', borderColor: 'green.700' }}
            borderTop='1px solid'
            borderColor='green.200'
            textAlign='center'
          >
            <VStack gap={1}>
              <Heading size='md' color='green.700' _dark={{ color: 'green.300' }}>
                Free for Manufacturing
              </Heading>
              <Text fontSize='lg' fontWeight='medium'>
                No licensing fees • No per-device costs • No subscription required
              </Text>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
