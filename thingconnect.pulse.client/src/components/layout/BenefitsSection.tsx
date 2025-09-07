import { Box, VStack, HStack, Heading, Text, Icon } from '@chakra-ui/react';
import { Check, Activity, TrendingUp, Shield, Zap } from 'lucide-react';

const benefits = [
  {
    title: 'Real-Time Monitoring',
    description: 'Continuous network monitoring with instant alerts for critical infrastructure endpoints',
    icon: Activity
  },
  {
    title: 'Historical Analytics',
    description: 'Track performance trends with automated data rollups and comprehensive reporting dashboards',
    icon: TrendingUp
  },
  {
    title: 'Manufacturing Reliability',
    description: 'Enterprise-grade uptime monitoring designed for mission-critical manufacturing operations',
    icon: Shield
  },
  {
    title: 'Instant Alerts',
    description: 'Automated outage detection with intelligent flap damping and configurable retry logic',
    icon: Zap
  }
];

export function BenefitsSection() {
  return (
    <Box 
      p={{ base: 8, lg: 16 }} 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      bg="gray.50"
    >
      <VStack align="start" gap={8} maxW="lg" mx="auto">
        <Box>
          <Box mb={6}>
            <Heading size="lg" color="#076bb3" fontWeight="bold">
              ThingConnect Pulse
            </Heading>
          </Box>
          <Heading size="2xl" color="gray.800" lineHeight="1.2" mb={4} fontWeight="bold">
            Network Availability Monitoring for Manufacturing Sites
          </Heading>
          <Text color="gray.600" fontSize="lg" fontWeight="medium">
            Monitor your critical infrastructure with real-time network availability tracking and automated alerting.
          </Text>
        </Box>

        <VStack align="start" gap={4} w="full">
          {benefits.map((benefit) => (
            <HStack key={benefit.title} align="start" gap={3}>
              <Box 
                bg="#076bb3" 
                borderRadius="full" 
                p={1} 
                mt={1} 
                w={6} 
                h={6} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Icon color="white" size="sm">
                  <Check />
                </Icon>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.800" fontSize="md">
                  {benefit.title}
                </Text>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  {benefit.description}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>

        <Box pt={6}>
          <Text fontSize="sm" color="gray.600" mb={4} fontWeight="semibold">
            Trusted for manufacturing excellence
          </Text>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              • ICMP, TCP & HTTP endpoint monitoring
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              • 15-minute and daily data rollups
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              • 60-day data retention for trend analysis
            </Text>
          </VStack>
        </Box>

        <Box pt={2}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Questions about deployment?{' '}
            <Text 
              as="span" 
              color="#076bb3" 
              textDecoration="underline" 
              cursor="pointer" 
              fontWeight="semibold"
            >
              Contact Support
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}