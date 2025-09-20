import { Box, Text, Grid, VStack, HStack } from '@chakra-ui/react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { testId } from '@/utils/testUtils';
import { ARIA_ROLES } from '@/utils/ariaUtils';

type StatusStat = {
  icon: any;
  title: string;
  subtitle: string;
  value: number;
  textColor: string;
  color: string;
  bg: string;
  darkColor: string;
  darkBg: string;
};

type SystemOverviewStatsProps = {
  statusCounts: {
    total: number;
    up: number;
    down: number;
    flapping: number;
  };
};

export function SystemOverviewStats({ statusCounts }: SystemOverviewStatsProps) {
  const stats: StatusStat[] = [
    {
      icon: Activity,
      title: 'TOTAL',
      subtitle: 'Total endpoints configured',
      value: statusCounts.total,
      textColor: 'blue.500',
      color: 'blue.600',
      bg: 'blue.100',
      darkColor: 'blue.200',
      darkBg: 'blue.800',
    },
    {
      icon: CheckCircle,
      title: 'ONLINE',
      subtitle: 'Currently operational',
      value: statusCounts.up,
      textColor: 'green.500',
      color: 'green.600',
      bg: 'green.100',
      darkColor: 'green.200',
      darkBg: 'green.800',
    },
    {
      icon: XCircle,
      title: 'OFFLINE',
      subtitle: 'Currently down',
      value: statusCounts.down,
      textColor: 'red.500',
      color: 'red.600',
      bg: 'red.100',
      darkColor: 'red.200',
      darkBg: 'red.800',
    },
    {
      icon: AlertTriangle,
      title: 'FLAPPING',
      subtitle: 'Unstable state changes',
      value: statusCounts.flapping,
      textColor: 'yellow.500',
      color: 'yellow.600',
      bg: 'yellow.100',
      darkColor: 'yellow.200',
      darkBg: 'yellow.800',
    },
  ];

  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }}
      gap='6'
      role="region"
      aria-label="System status overview"
      data-testid={testId.custom(['system', 'overview', 'grid'])}
    >
      {stats.map((stat) => {
        const statKey = stat.title.toLowerCase();

        return (
          <article
            key={stat.title}
            data-testid={testId.card(`stat-${statKey}`)}
            role={ARIA_ROLES.ARTICLE}
            aria-labelledby={`stat-${statKey}-title`}
            aria-describedby={`stat-${statKey}-description`}
          >
            <Box
              p='4'
              borderRadius='xl'
              borderWidth={1}
              _dark={{ bg: 'gray.800' }}
              role={ARIA_ROLES.STATUS}
              aria-live="polite"
            >
              <VStack align='flex-start'>
                <HStack justifyContent={'space-between'} w={'full'}>
                  <Text
                    id={`stat-${statKey}-title`}
                    fontSize='lg'
                    fontWeight='semibold'
                    color='gray.500'
                    role={ARIA_ROLES.HEADING}
                    aria-level={3}
                  >
                    {stat.title}
                  </Text>
                  <Box>
                    <Box
                      bg={stat.bg}
                      color={stat.color}
                      _dark={{ bg: stat.darkBg, color: stat.color }}
                      boxSize='12'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      borderRadius='full'
                      aria-hidden="true"
                      data-testid={testId.custom(['stat', statKey, 'icon'])}
                    >
                      <stat.icon size={28} />
                    </Box>
                  </Box>
                </HStack>
                <Box>
                  <Text
                    fontSize='4xl'
                    fontWeight='bold'
                    color={stat.textColor}
                    data-testid={testId.custom(['stat', statKey, 'value'])}
                    aria-label={`${stat.value} ${stat.title.toLowerCase()}`}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    id={`stat-${statKey}-description`}
                    fontSize='sm'
                    color='gray.500'
                  >
                    {stat.subtitle}
                  </Text>
                </Box>
              </VStack>
            </Box>
          </article>
        );
      })}
    </Grid>
  );
}
