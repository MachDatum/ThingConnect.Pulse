import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Image,
  Badge,
  Link,
  Button
} from '@chakra-ui/react';
import { Info, ExternalLink, Heart } from 'lucide-react';
import thingConnectLogo from '@/assets/thingconnect-logo.svg';

export default function About() {
  return (
    <VStack gap={8} align='stretch' maxW='800px' mx='auto' p={6}>
      <Box textAlign='center'>
        <HStack justify='center' gap={4} mb={4}>
          <Image src={thingConnectLogo} alt='ThingConnect' h='48px' />
          <Box textAlign='left'>
            <Heading size='xl' color='blue.600' _dark={{ color: 'blue.400' }}>
              ThingConnect Pulse
            </Heading>
            <HStack gap={2} mt={1}>
              <Badge colorPalette='blue' variant='solid'>v1.0.0</Badge>
              <Badge variant='outline'>Network Monitor</Badge>
            </HStack>
          </Box>
        </HStack>
        <Text fontSize='lg' color='gray.600' _dark={{ color: 'gray.400' }}>
          Free, on-premises availability monitoring for manufacturing IT/OT
        </Text>
      </Box>

      <VStack gap={6} align='stretch'>
        <Box p={6} borderRadius='lg' bg='blue.50' _dark={{ bg: 'blue.900' }}>
          <HStack gap={3} mb={4}>
            <Info size={20} />
            <Heading size='md'>Product Overview</Heading>
          </HStack>
          <Text lineHeight='tall'>
            ThingConnect Pulse provides YAML-configured monitoring with live dashboard, 
            historical rollups, and CSV export. Designed for plant IT/OT admins, production 
            supervisors, and maintenance engineers who need reliable network device monitoring 
            with zero external dependencies.
          </Text>
        </Box>

        <VStack gap={4} align='stretch'>
          <Heading size='md'>Key Features</Heading>
          
          <VStack gap={3} align='stretch'>
            <Box p={4} borderRadius='md' border='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
              <Text fontWeight='semibold' mb={2}>🚀 Lightweight Setup</Text>
              <Text fontSize='sm'>5-minute installation with single Windows Service installer. No complex dependencies or configuration required.</Text>
            </Box>
            
            <Box p={4} borderRadius='md' border='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
              <Text fontWeight='semibold' mb={2}>🏠 Local-First Architecture</Text>
              <Text fontSize='sm'>All data stays on-premises with no cloud dependencies. Perfect for air-gapped manufacturing environments.</Text>
            </Box>
            
            <Box p={4} borderRadius='md' border='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
              <Text fontWeight='semibold' mb={2}>📝 Readable Configuration</Text>
              <Text fontSize='sm'>Simple YAML configuration with explicit Apply workflow. Supports CIDR ranges and wildcard discovery.</Text>
            </Box>
            
            <Box p={4} borderRadius='md' border='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
              <Text fontWeight='semibold' mb={2}>📱 Mobile-Friendly Dashboard</Text>
              <Text fontSize='sm'>Responsive interface optimized for tablets and phones. Perfect for shift supervisors on the factory floor.</Text>
            </Box>
          </VStack>
        </VStack>

        <VStack gap={4} align='stretch'>
          <Heading size='md'>Technology Stack</Heading>
          <HStack gap={2} flexWrap='wrap'>
            <Badge variant='outline'>ASP.NET Core 8.0</Badge>
            <Badge variant='outline'>React 19</Badge>
            <Badge variant='outline'>TypeScript</Badge>
            <Badge variant='outline'>Chakra UI</Badge>
            <Badge variant='outline'>Entity Framework</Badge>
            <Badge variant='outline'>SQLite</Badge>
            <Badge variant='outline'>Windows Service</Badge>
          </HStack>
        </VStack>

        <Box p={6} borderRadius='lg' bg='gray.50' _dark={{ bg: 'gray.800' }}>
          <VStack gap={4} align='center'>
            <HStack gap={2}>
              <Heart size={16} color='red' />
              <Text fontWeight='semibold'>Powered by ThingConnect</Text>
            </HStack>
            <Text fontSize='sm' textAlign='center' color='gray.600' _dark={{ color: 'gray.400' }}>
              ThingConnect specializes in manufacturing connectivity solutions, 
              helping plants optimize their industrial networks and data infrastructure.
            </Text>
            <HStack gap={4}>
              <Link
                href='https://thingconnect.com'
                target='_blank'
                rel='noopener noreferrer'
                _hover={{ textDecoration: 'none' }}
              >
                <Button
                  size='sm'
                  variant='outline'
                >
                  <ExternalLink size={16} />
                  Visit ThingConnect.com
                </Button>
              </Link>
              <Link
                href='https://github.com/MachDatum/ThingConnect.Pulse'
                target='_blank'
                rel='noopener noreferrer'
                _hover={{ textDecoration: 'none' }}
              >
                <Button
                  size='sm'
                  variant='outline'
                >
                <ExternalLink size={16} />
                View Source Code
              </Button>
              </Link>
            </HStack>
          </VStack>
        </Box>

        <Box p={4} borderRadius='md' bg='yellow.50' _dark={{ bg: 'yellow.900' }}>
          <Text fontSize='sm' color='yellow.800' _dark={{ color: 'yellow.200' }}>
            <Text fontWeight='semibold'>License:</Text> Free for manufacturing environments. 
            No licensing fees, no per-device costs, no subscription required.
          </Text>
        </Box>
      </VStack>
    </VStack>
  );
}