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
  Button,
  Alert,
  Flex,
  Separator
} from '@chakra-ui/react';
import {
  Bell,
  Palette,
  Database,
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Page } from '@/components/layout/Page';
import { PageContent } from '@/components/layout/PageContent';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useTelemetryConsent } from '@/features/auth/hooks/useTelemetryConsent';
import { Link as RouterLink } from 'react-router-dom';

export default function Settings() {
  const analytics = useAnalytics();
  const { saveTelemetryConsent, getTelemetryConsent } = useTelemetryConsent();
  const [telemetryConsent, setTelemetryConsent] = useState({
    errorDiagnostics: false,
    usageAnalytics: false
  });
  const [originalConsent, setOriginalConsent] = useState({
    errorDiagnostics: false,
    usageAnalytics: false
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  // Track page view
  useEffect(() => {
    analytics.trackPageView('Settings', {
      view_type: 'telemetry_settings',
      section: 'privacy_controls'
    });
  }, []);

  // Load current consent settings on component mount
  useEffect(() => {
    const loadConsent = async () => {
      try {
        const consent = await getTelemetryConsent();
        console.log('Loaded consent from API:', consent);
        setTelemetryConsent(consent);
        setOriginalConsent(consent);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Failed to load telemetry consent:', err);
        setIsInitialLoad(false);
      }
    };
    loadConsent();
  }, [getTelemetryConsent]); // Now safe to use as dependency since it's useCallback wrapped

  const handleSaveConsent = async () => {
    console.log('Saving consent:', telemetryConsent);
    setIsSaving(true);
    setError('');
    setSaveMessage('');

    try {
      await saveTelemetryConsent(telemetryConsent);
      console.log('Consent saved successfully');
      setOriginalConsent(telemetryConsent); // Update the original state
      setSaveMessage('Telemetry preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save telemetry preferences';
      setError(errorMessage);
      // Revert to original state on error
      setTelemetryConsent(originalConsent);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(telemetryConsent) !== JSON.stringify(originalConsent);

  const upcomingFeatures = [
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent alerts with customizable thresholds and notification channels',
      priority: 'High Priority',
      color: 'blue',
    },
    {
      icon: Palette,
      title: 'Dashboard Customization',
      description: 'Personalize your monitoring experience with custom themes and layouts',
      priority: 'Medium Priority',
      color: 'purple',
    },
    {
      icon: Database,
      title: 'System Management',
      description: 'Advanced system diagnostics and performance optimization tools',
      priority: 'Medium Priority',
      color: 'green',
    },
  ];

  return (
    <Page
      title='Settings'
      testId='settings-page'
      description='Advanced configuration and customization options'
    >
      <PageContent>
        <Container maxW='4xl' py={8}>
          {/* Telemetry Consent Section */}
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
            mb={12}
          >
            <VStack gap={6} align='start'>
              <HStack gap={3}>
                <Box
                  p={3}
                  borderRadius='lg'
                  bg='blue.50'
                  _dark={{ bg: 'blue.900' }}
                >
                  <Icon as={Shield} boxSize={6} color='blue.500' />
                </Box>
                <VStack align='start' gap={1}>
                  <Heading size='lg' color='gray.800' _dark={{ color: 'white' }}>
                    Telemetry & Analytics
                  </Heading>
                  <Text color='gray.600' _dark={{ color: 'gray.400' }}>
                    Help us improve ThingConnect Pulse by sharing anonymous usage data
                  </Text>
                </VStack>
              </HStack>

              {error && (
                <Alert.Root status='error' variant='subtle' w='full'>
                  <Alert.Indicator />
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
              )}

              {saveMessage && (
                <Alert.Root status='success' variant='subtle' w='full'>
                  <Alert.Indicator />
                  <Alert.Title>{saveMessage}</Alert.Title>
                </Alert.Root>
              )}

              <VStack gap={4} w='full' align='start'>
                <Flex justify='space-between' align='center' w='full'>
                  <VStack align='start' gap={1} flex='1'>
                    <HStack gap={2}>
                      <Text fontWeight='medium' color='gray.800' _dark={{ color: 'white' }}>
                        Send sanitized error diagnostics
                      </Text>
                      {telemetryConsent.errorDiagnostics && <Icon as={CheckCircle} boxSize={4} color='green.500' />}
                    </HStack>
                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                      Helps us identify and fix crashes faster. Only sends exception types, stack traces without sensitive data.
                    </Text>
                  </VStack>
                  <Switch
                    checked={telemetryConsent.errorDiagnostics}
                    onCheckedChange={(details) => {
                      console.log('Error diagnostics changed to:', details.checked);
                      setTelemetryConsent(prev => ({ ...prev, errorDiagnostics: details.checked }));
                    }}
                    colorPalette='blue'
                    size='md'
                    disabled={isInitialLoad || isSaving}
                  />
                </Flex>

                <Separator />

                <Flex justify='space-between' align='center' w='full'>
                  <VStack align='start' gap={1} flex='1'>
                    <HStack gap={2}>
                      <Text fontWeight='medium' color='gray.800' _dark={{ color: 'white' }}>
                        Send anonymous usage analytics
                      </Text>
                      {telemetryConsent.usageAnalytics && <Icon as={CheckCircle} boxSize={4} color='green.500' />}
                    </HStack>
                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                      Helps us understand which features are useful. Only sends feature usage counts, no personal information.
                    </Text>
                  </VStack>
                  <Switch
                    checked={telemetryConsent.usageAnalytics}
                    onCheckedChange={(details) => {
                      console.log('Usage analytics changed to:', details.checked);
                      setTelemetryConsent(prev => ({ ...prev, usageAnalytics: details.checked }));
                    }}
                    colorPalette='blue'
                    size='md'
                    disabled={isInitialLoad || isSaving}
                  />
                </Flex>
              </VStack>

              {isInitialLoad ? (
                <Flex justify='center' w='full' pt={2}>
                  <Text fontSize='sm' color='gray.500' _dark={{ color: 'gray.500' }}>
                    Loading current preferences...
                  </Text>
                </Flex>
              ) : (
                <Flex justify='space-between' align='center' w='full' pt={2}>
                  <Text fontSize='sm' color='gray.500' _dark={{ color: 'gray.500' }}>
                    {hasChanges ? 'You have unsaved changes' : 'All changes saved and stored machine-wide'}
                  </Text>
                  <LoadingButton
                    size='sm'
                    onClick={handleSaveConsent}
                    loading={isSaving}
                    loadingText='Saving...'
                    colorPalette='blue'
                    disabled={!hasChanges}
                    variant={hasChanges ? 'solid' : 'outline'}
                  >
                    {hasChanges ? 'Save Changes' : 'Saved'}
                  </LoadingButton>
                </Flex>
              )}
            </VStack>
          </Box>

          {/* Hero Section */}
          <VStack gap={6} textAlign='center' mb={12}>
            <Box p={4} borderRadius='full' bg='blue.50' _dark={{ bg: 'blue.900' }}>
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
                We're crafting powerful configuration tools to give you complete control over your
                monitoring experience
              </Text>
            </VStack>

            <HStack gap={2}>
              <Icon as={Sparkles} boxSize={5} color='blue.500' />
              <Badge colorPalette='blue' variant='subtle' size='lg' px={3} py={1}>
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
                      bg: 'gray.800',
                    }}
                    bg='white'
                    shadow='sm'
                    transition='all 0.2s'
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-2px)',
                      borderColor: 'blue.300',
                      _dark: { borderColor: 'blue.600' },
                    }}
                  >
                    <HStack gap={4} align='start'>
                      <Box
                        p={3}
                        borderRadius='lg'
                        bg={`${feature.color}.50`}
                        _dark={{ bg: `${feature.color}.900` }}
                      >
                        <Icon as={feature.icon} boxSize={6} color={`${feature.color}.500`} />
                      </Box>

                      <VStack align='start' flex='1' gap={2}>
                        <HStack justify='space-between' w='100%'>
                          <Heading size='md' color='gray.800' _dark={{ color: 'white' }}>
                            {feature.title}
                          </Heading>
                          <Badge colorPalette={feature.color} variant='subtle' size='sm'>
                            {feature.priority}
                          </Badge>
                        </HStack>

                        <Text color='gray.600' _dark={{ color: 'gray.300' }} lineHeight='1.5'>
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
          <VStack
            gap={4}
            textAlign='center'
            mt={12}
            pt={8}
            borderTop='1px solid'
            borderColor='gray.200'
            _dark={{ borderColor: 'gray.700' }}
          >
            <VStack gap={2}>
              <HStack gap={2} color='gray.500' _dark={{ color: 'gray.400' }}>
                <Icon as={Clock} boxSize={4} />
                <Text fontSize='sm' fontWeight='medium'>
                  Updates coming in future releases
                </Text>
              </HStack>

              <Text fontSize='sm' color='gray.500' _dark={{ color: 'gray.400' }}>
                Continue monitoring with the current powerful features while we build these
                enhancements
              </Text>
            </VStack>
            <RouterLink to={`/about`}>
              <Button variant='outline' colorPalette='blue' size='sm' as='a'>
                <ArrowRight size={16} />
                Learn More About ThingConnect Pulse
              </Button>
            </RouterLink>
          </VStack>
        </Container>
      </PageContent>
    </Page>
  );
}
