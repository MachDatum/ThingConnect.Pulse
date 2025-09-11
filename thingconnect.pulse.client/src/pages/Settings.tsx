import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Heading, 
  Container,
  Icon,
  Badge,
  Grid,
  GridItem,
  Button
} from '@chakra-ui/react';
import { 
  Bell, 
  Palette, 
  Database, 
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { PageContent } from '@/components/layout/PageContent';

export default function Settings() {
  const upcomingFeatures = [
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent alerts with customizable thresholds and notification channels',
      priority: 'High Priority',
      color: 'blue'
    },
    {
      icon: Palette,
      title: 'Dashboard Customization',
      description: 'Personalize your monitoring experience with custom themes and layouts',
      priority: 'Medium Priority', 
      color: 'purple'
    },
    {
      icon: Database,
      title: 'System Management',
      description: 'Advanced system diagnostics and performance optimization tools',
      priority: 'Medium Priority',
      color: 'green'
    }
  ];

  return (
    <Page
      title='Settings'
      testId='settings-page'
      description='Advanced configuration and customization options'
    >
      <PageContent>
        <Container maxW='4xl' py={8}>
          {/* Hero Section */}
          <VStack gap={6} textAlign='center' mb={12}>
            <Box
              p={4}
              borderRadius='full'
              bg='blue.50'
              _dark={{ bg: 'blue.900' }}
            >
              <Icon as={SettingsIcon} boxSize={12} color='blue.500' />
            </Box>
            
            <VStack gap={3}>
              <Heading size='2xl' color='gray.800' _dark={{ color: 'white' }}>
                Advanced Settings
              </Heading>
              <Text 
                fontSize='lg' 
                color='gray.600' 
                _dark={{ color: 'gray.300' }}
                maxW='2xl'
                lineHeight='1.6'
              >
                We're crafting powerful configuration tools to give you complete control 
                over your monitoring experience
              </Text>
            </VStack>

            <HStack gap={2}>
              <Icon as={Sparkles} boxSize={5} color='blue.500' />
              <Badge 
                colorPalette='blue' 
                variant='subtle' 
                size='lg'
                px={3}
                py={1}
              >
                Coming Soon
              </Badge>
            </HStack>
          </VStack>

          {/* Features Preview */}
          <VStack gap={8}>
            <VStack gap={2} textAlign='center'>
              <Heading size='lg' color='gray.800' _dark={{ color: 'white' }}>
                What's Coming
              </Heading>
              <Text color='gray.600' _dark={{ color: 'gray.400' }}>
                Enhanced features to customize your monitoring experience
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(1, 1fr)' }} gap={6} w='100%'>
              {upcomingFeatures.map((feature, index) => (
                <GridItem key={index}>
                  <Box
                    p={6}
                    borderRadius='xl'
                    border='1px solid'
                    borderColor='gray.200'
                    _dark={{ 
                      borderColor: 'gray.700',
                      bg: 'gray.800'
                    }}
                    bg='white'
                    shadow='sm'
                    transition='all 0.2s'
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-2px)',
                      borderColor: 'blue.300',
                      _dark: { borderColor: 'blue.600' }
                    }}
                  >
                    <HStack gap={4} align='start'>
                      <Box
                        p={3}
                        borderRadius='lg'
                        bg={`${feature.color}.50`}
                        _dark={{ bg: `${feature.color}.900` }}
                      >
                        <Icon 
                          as={feature.icon} 
                          boxSize={6} 
                          color={`${feature.color}.500`}
                        />
                      </Box>
                      
                      <VStack align='start' flex='1' gap={2}>
                        <HStack justify='space-between' w='100%'>
                          <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                            {feature.title}
                          </Heading>
                          <Badge 
                            colorPalette={feature.color}
                            variant='subtle'
                            size='sm'
                          >
                            {feature.priority}
                          </Badge>
                        </HStack>
                        
                        <Text 
                          color='gray.600' 
                          _dark={{ color: 'gray.300' }}
                          lineHeight='1.5'
                        >
                          {feature.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </VStack>

          {/* Call to Action */}
          <VStack gap={4} textAlign='center' mt={12} pt={8} borderTop='1px solid' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }}>
            <VStack gap={2}>
              <HStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
                <Icon as={Clock} boxSize={4} />
                <Text fontSize='sm' fontWeight='medium'>
                  Updates coming in future releases
                </Text>
              </HStack>
              
              <Text fontSize='sm' color='gray.500' _dark={{ color: 'gray.400' }}>
                Continue monitoring with the current powerful features while we build these enhancements
              </Text>
            </VStack>

            <Button
              variant='outline'
              colorPalette='blue'
              size='sm'
              asChild
            >
              <a href='/about'>
                Learn More About ThingConnect Pulse
                <ArrowRight size={16} />
              </a>
            </Button>
          </VStack>
        </Container>
      </PageContent>
    </Page>
  );
}
