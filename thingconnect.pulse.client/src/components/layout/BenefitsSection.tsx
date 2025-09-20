import { Box, VStack, HStack, Heading, Text, Icon, Image } from '@chakra-ui/react';
import { Check, Activity, TrendingUp, Shield, Zap } from 'lucide-react';
import thingConnectLogo from '@/assets/thingconnect-pulse-logo.svg';

const benefits = [
  {
    title: 'Real-Time Monitoring',
    description:
      'Continuous network monitoring with instant alerts for critical infrastructure endpoints',
    icon: Activity,
  },
  {
    title: 'Historical Analytics',
    description:
      'Track performance trends with automated data rollups and comprehensive reporting dashboards',
    icon: TrendingUp,
  },
  {
    title: 'Manufacturing Reliability',
    description:
      'Enterprise-grade uptime monitoring designed for mission-critical manufacturing operations',
    icon: Shield,
  },
  {
    title: 'Instant Alerts',
    description:
      'Automated outage detection with intelligent flap damping and configurable retry logic',
    icon: Zap,
  },
];

export function BenefitsSection() {
  return (
    <Box
      p={{ base: 3, sm: 4, md: 6, lg: 8 }}
      display='flex'
      flexDirection='column'
      justifyContent='center'
      bg='bg.subtle'
      h='100dvh'
    >
      <VStack align='start' gap={{ base: 2, sm: 3, md: 4 }} maxW={{ base: 'full', sm: 'md', lg: 'lg' }} mx='auto' w='full'>
        <Box w='full'>
          <Box mb={{ base: 2, md: 3 }}>
            <Image src={thingConnectLogo} alt='ThingConnect' h='50px' />
          </Box>
          <Heading
            size={{ base: 'lg', sm: 'xl', md: '2xl' }}
            color='fg'
            lineHeight='1.1'
            mb={{ base: 2, md: 3 }}
            fontWeight='bold'
          >
            Network Availability Monitoring for Manufacturing Sites
          </Heading>
          <Text color='fg.muted' fontSize={{ base: 'sm', md: 'md' }} fontWeight='medium'>
            Monitor your critical infrastructure with real-time network availability tracking and
            automated alerting.
          </Text>
        </Box>

        <VStack align='start' gap={{ base: 2, md: 4 }} w='full'>
          {benefits.map(benefit => (
            <HStack key={benefit.title} align='start' gap={{ base: 2, md: 3 }} w='full'>
              <Box
                bg='#076bb3'
                borderRadius='full'
                p={0.5}
                mt={0.5}
                w={{ base: 4, md: 5 }}
                h={{ base: 4, md: 5 }}
                display='flex'
                alignItems='center'
                justifyContent='center'
                flexShrink={0}
              >
                <Icon color='white' size='xs'>
                  <Check />
                </Icon>
              </Box>
              <Box flex='1' minW={0}>
                <Text fontWeight='bold' color='fg' fontSize={{ base: 'xs', md: 'sm' }}>
                  {benefit.title}
                </Text>
                <Text color='fg.muted' fontSize={{ base: '2xs', md: 'xs' }} fontWeight='medium' lineHeight='1.3'>
                  {benefit.description}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>

        <Box pt={{ base: 2, md: 3 }} w='full'>
          <Text fontSize={{ base: '2xs', md: 'xs' }} color='fg.muted' mb={{ base: 1, md: 2 }} fontWeight='semibold'>
            Trusted for manufacturing excellence
          </Text>
          <VStack align='start' gap={{ base: 0.5, md: 1 }}>
            <Text fontSize={{ base: '2xs', md: 'xs' }} color='fg.muted' fontWeight='medium'>
              • ICMP, TCP & HTTP endpoint monitoring
            </Text>
            <Text fontSize={{ base: '2xs', md: 'xs' }} color='fg.muted' fontWeight='medium'>
              • 15-minute and daily data rollups
            </Text>
            <Text fontSize={{ base: '2xs', md: 'xs' }} color='fg.muted' fontWeight='medium'>
              • 60-day data retention for trend analysis
            </Text>
          </VStack>
        </Box>

        {/* <Box pt={2}>
          <Text fontSize='sm' color='gray.600' fontWeight='medium'>
            Questions about deployment?{' '}
            <Text
              as='span'
              color='#076bb3'
              textDecoration='underline'
              cursor='pointer'
              fontWeight='semibold'
            >
              Contact Support
            </Text>
          </Text>
        </Box> */}
      </VStack>
    </Box>
  );
}
