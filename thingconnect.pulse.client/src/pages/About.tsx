import { Box, Text, VStack, HStack, Image, Badge, Link, Button } from '@chakra-ui/react';
import { ExternalLink, Heart } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { PageSection } from '@/components/layout/PageSection';
import thingConnectLogo from '@/assets/thingconnect-logo.svg';

export default function About() {
  return (
    <Page
      title='About'
      description='Free, on-premises availability monitoring for manufacturing IT/OT'
    >
      {/* <PageHeader
        title="ThingConnect Pulse"
        description="Free, on-premises availability monitoring for manufacturing IT/OT"
        icon={<Info size={20} />}
      />
       */}
      <VStack align='center' gap={4} maxW='600px' mx='auto'>
        <HStack justify='center' gap={3}>
          <Image src={thingConnectLogo} alt='ThingConnect' h='40px' />
          <VStack align='start' gap={1}>
            <HStack gap={2}>
              <Badge colorPalette='blue' variant='solid' size='sm'>
                v1.0.0
              </Badge>
              <Badge variant='outline' size='sm'>
                Network Monitor
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      </VStack>

      <PageSection>
        <Box
          p={3}
          borderRadius='md'
          bg='gray.50'
          _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
          border='1px solid'
          borderColor='gray.200'
        >
          <Text fontSize='sm' lineHeight='1.5'>
            ThingConnect Pulse provides YAML-configured monitoring with live dashboard, historical
            rollups, and CSV export. Designed for plant IT/OT admins, production supervisors, and
            maintenance engineers who need reliable network device monitoring with zero external
            dependencies.
          </Text>
        </Box>
      </PageSection>

      <PageSection title='Key Features'>
        <VStack gap={2}>
          <Box
            p={3}
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <Text fontWeight='medium' fontSize='sm' mb={1}>
              🚀 Lightweight Setup
            </Text>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
              5-minute installation with single Windows Service installer.
            </Text>
          </Box>

          <Box
            p={3}
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <Text fontWeight='medium' fontSize='sm' mb={1}>
              🏠 Local-First Architecture
            </Text>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
              All data stays on-premises with no cloud dependencies.
            </Text>
          </Box>

          <Box
            p={3}
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <Text fontWeight='medium' fontSize='sm' mb={1}>
              📝 Readable Configuration
            </Text>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
              Simple YAML configuration with explicit Apply workflow.
            </Text>
          </Box>

          <Box
            p={3}
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <Text fontWeight='medium' fontSize='sm' mb={1}>
              📱 Mobile-Friendly Dashboard
            </Text>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
              Responsive interface optimized for tablets and phones.
            </Text>
          </Box>
        </VStack>
      </PageSection>

      <PageSection title='Technology Stack'>
        <Box display='flex' gap={1} flexWrap='wrap'>
          <Badge variant='outline' size='sm'>
            ASP.NET Core 8.0
          </Badge>
          <Badge variant='outline' size='sm'>
            React 19
          </Badge>
          <Badge variant='outline' size='sm'>
            TypeScript
          </Badge>
          <Badge variant='outline' size='sm'>
            Chakra UI
          </Badge>
          <Badge variant='outline' size='sm'>
            Entity Framework
          </Badge>
          <Badge variant='outline' size='sm'>
            SQLite
          </Badge>
          <Badge variant='outline' size='sm'>
            Windows Service
          </Badge>
        </Box>
      </PageSection>

      <PageSection>
        <Box p={3} borderRadius='md' bg='gray.50' _dark={{ bg: 'gray.800' }}>
          <VStack gap={2} align='center'>
            <HStack gap={1}>
              <Heart size={16} color='red' />
              <Text fontWeight='medium' fontSize='sm'>
                Powered by ThingConnect
              </Text>
            </HStack>
            <Text fontSize='sm' textAlign='center' color='gray.600' _dark={{ color: 'gray.400' }}>
              ThingConnect specializes in manufacturing connectivity solutions, helping plants
              optimize their industrial networks and data infrastructure.
            </Text>
            <HStack gap={2}>
              <Button asChild size='sm' variant='outline' h='32px'>
                <Link href='https://thingconnect.com' target='_blank' rel='noopener noreferrer'>
                  <ExternalLink size={14} />
                  Visit Site
                </Link>
              </Button>
              <Button asChild size='sm' variant='outline' h='32px'>
                <Link
                  href='https://github.com/MachDatum/ThingConnect.Pulse'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink size={14} />
                  Source Code
                </Link>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </PageSection>

      <Box
        p={3}
        borderRadius='md'
        bg='yellow.100'
        _dark={{ bg: 'yellow.900', color: 'yellow.200' }}
        color='yellow.800'
      >
        <Text fontSize='sm'>
          <Text as='span' fontWeight='medium'>
            License:
          </Text>{' '}
          Free for manufacturing environments. No licensing fees, no per-device costs, no
          subscription required.
        </Text>
      </Box>
    </Page>
  );
}
