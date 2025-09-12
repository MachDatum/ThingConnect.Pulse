import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Stack,
  Flex,
  Collapsible,
  Code
} from '@chakra-ui/react';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/form/LoadingButton';

interface TelemetryConsentStepProps {
  onBack: () => void;
  onSubmit: (consent: { errorDiagnostics: boolean; usageAnalytics: boolean }) => void;
  isSubmitting: boolean;
}

interface TelemetryConsent {
  errorDiagnostics: boolean;
  usageAnalytics: boolean;
}

export function TelemetryConsentStep({ onBack, onSubmit, isSubmitting }: TelemetryConsentStepProps) {
  const [consent, setConsent] = useState<TelemetryConsent>({
    errorDiagnostics: false,
    usageAnalytics: false
  });
  const [showSamples, setShowSamples] = useState(false);

  const handleConsentChange = (type: keyof TelemetryConsent, value: boolean) => {
    setConsent(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = () => {
    onSubmit(consent);
  };

  return (
    <VStack gap={6}>
      <Box textAlign="center">
        <Heading size="lg" mb={2} color="gray.800" fontWeight="bold">
          Help improve ThingConnect Pulse?
        </Heading>
        <Text color="gray.600" fontSize="lg" fontWeight="medium" maxW="lg">
          Enable anonymous diagnostics so we can fix crashes faster and learn which screens are useful. 
          We never send IPs, hostnames, usernames, device labels, or any YAML content.
        </Text>
      </Box>

      <VStack gap={4} w="full" align="start">
        <Box p={4} bg="gray.50" rounded="md" w="full">
          <Flex justify="space-between" align="center" mb={2}>
            <VStack align="start" gap={1} flex="1">
              <Text fontWeight="medium" color="gray.800">
                Send sanitized error diagnostics (recommended)
              </Text>
              <Text fontSize="sm" color="gray.600">
                Sends exception type, short stack with file basenames, app version, OS family, DB mode.
              </Text>
            </VStack>
            <Switch
              checked={consent.errorDiagnostics}
              onCheckedChange={(details) => handleConsentChange('errorDiagnostics', details.checked)}
              colorPalette="blue"
              size="md"
              disabled={isSubmitting}
            />
          </Flex>
        </Box>

        <Box p={4} bg="gray.50" rounded="md" w="full">
          <Flex justify="space-between" align="center" mb={2}>
            <VStack align="start" gap={1} flex="1">
              <Text fontWeight="medium" color="gray.800">
                Send anonymous feature-usage counts
              </Text>
              <Text fontSize="sm" color="gray.600">
                Sends event names like `ui.page_view`, `ui.csv_export` with whitelisted properties (no free text).
              </Text>
            </VStack>
            <Switch
              checked={consent.usageAnalytics}
              onCheckedChange={(details) => handleConsentChange('usageAnalytics', details.checked)}
              colorPalette="blue"
              size="md"
              disabled={isSubmitting}
            />
          </Flex>
        </Box>
      </VStack>

      <Collapsible.Root open={showSamples} onOpenChange={(details) => setShowSamples(details.open)}>
        <Collapsible.Trigger asChild>
          <Box
            as="button"
            color="#076bb3"
            textDecoration="underline"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ color: "#065a93" }}
            _disabled={{ color: "gray.400", cursor: "not-allowed" }}
            {...(isSubmitting && { disabled: true })}
          >
            {showSamples ? 'Hide' : 'See'} sample payloads
          </Box>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <VStack gap={4} mt={4} align="start" w="full">
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Error event example:
              </Text>
              <Code
                display="block"
                whiteSpace="pre"
                p={3}
                fontSize="xs"
                bg="gray.100"
                color="gray.800"
                rounded="md"
                overflow="auto"
                w="full"
              >
{`{
  "type": "error",
  "app_version": "1.0.0",
  "os": "Windows",
  "db_mode": "sqlite",
  "exception": "DbUpdateException",
  "stack": [{"m": "RollupJob.Run", "f": "RollupJob.cs", "l": 142}],
  "fingerprint": "c1c8…",
  "anonymous_id": "c0f7…"
}`}
              </Code>
            </Box>

            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Usage event example:
              </Text>
              <Code
                display="block"
                whiteSpace="pre"
                p={3}
                fontSize="xs"
                bg="gray.100"
                color="gray.800"
                rounded="md"
                overflow="auto"
                w="full"
              >
{`{
  "type": "usage",
  "app_version": "1.0.0",
  "os": "Windows",
  "event": "ui.page_view",
  "properties": {
    "page": "dashboard",
    "device_count": 15
  },
  "anonymous_id": "c0f7…"
}`}
              </Code>
            </Box>
          </VStack>
        </Collapsible.Content>
      </Collapsible.Root>

      <Stack direction="row" gap={4} w="full" pt={2}>
        <LoadingButton
          variant="outline"
          size="lg"
          flex="1"
          onClick={onBack}
          isLoading={isSubmitting}
          bg="transparent"
          color="#076bb3"
          borderColor="#076bb3"
          _hover={{ bg: "#076bb3", color: "white" }}
          _disabled={{
            bg: "transparent",
            color: "gray.400",
            borderColor: "gray.400",
            cursor: "not-allowed",
            _hover: { bg: "transparent", color: "gray.400" }
          }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          size="lg"
          flex="1"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Saving preferences..."
        >
          Continue
        </LoadingButton>
      </Stack>
    </VStack>
  );
}