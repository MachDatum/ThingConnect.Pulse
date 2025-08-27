import { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Textarea,
  Text,
  Heading,
  Badge
} from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { FileText, Upload, Check, AlertCircle, Download } from 'lucide-react';
import { configurationService } from '@/api/services/configuration.service';
import type { ConfigurationApplyResponse } from '@/api/types';

interface ConfigurationEditorProps {
  onConfigurationApplied?: (response: ConfigurationApplyResponse) => void;
}

export function ConfigurationEditor({ onConfigurationApplied }: ConfigurationEditorProps) {
  const [yamlContent, setYamlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors?: string[];
  } | null>(null);
  const [applyResult, setApplyResult] = useState<ConfigurationApplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/x-yaml' || file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setYamlContent(content);
        setValidationResult(null);
        setApplyResult(null);
        setError(null);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid YAML file (.yaml or .yml)');
    }
  };

  const handleValidate = async () => {
    if (!yamlContent.trim()) {
      setError('Please enter YAML configuration content');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await configurationService.validateConfiguration(yamlContent);
      setValidationResult(result);
    } catch (err) {
      setError((err as Error).message);
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!yamlContent.trim()) {
      setError('Please enter YAML configuration content');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await configurationService.applyConfiguration(yamlContent);
      setApplyResult(response);
      onConfigurationApplied?.(response);
    } catch (err) {
      setError((err as Error).message);
      setApplyResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <VStack gap={6} align='stretch'>
      <Box>
        <HStack gap={3} align='center' mb={4}>
          <FileText size={20} />
          <Heading size='md'>YAML Configuration Editor</Heading>
        </HStack>
        
        <HStack gap={2} mb={4}>
          <Button
            variant='outline'
            size='sm'
            leftIcon={<Upload size={16} />}
            onClick={handleLoadFromFile}
          >
            Load from File
          </Button>
          
          <input
            ref={fileInputRef}
            type='file'
            accept='.yaml,.yml,application/x-yaml'
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </HStack>

        <Textarea
          value={yamlContent}
          onChange={(e) => {
            setYamlContent(e.target.value);
            setValidationResult(null);
            setApplyResult(null);
            setError(null);
          }}
          placeholder={`# Example YAML configuration
version: 1
defaults:
  interval_seconds: 10
  timeout_ms: 1500
  retries: 1

groups:
  - { id: "network", name: "Network Infrastructure" }
  - { id: "servers", name: "Servers" }

targets:
  - type: icmp
    host: 8.8.8.8
    name: "Google DNS"
    group: network
  
  - type: tcp
    host: 192.168.1.1
    port: 80
    name: "Router Web Interface"
    group: network
    
  - type: http
    host: example.com
    http_path: /health
    http_match: "OK"
    name: "Example Health Check"
    group: servers`}
          minH='300px'
          fontFamily='monospace'
          fontSize='sm'
          whiteSpace='pre'
          overflowWrap='break-word'
        />
      </Box>

      {error && (
        <Alert status='error'>
          <AlertCircle size={16} />
          <Text>{error}</Text>
        </Alert>
      )}

      {validationResult && (
        <Alert status={validationResult.isValid ? 'success' : 'error'}>
          {validationResult.isValid ? <Check size={16} /> : <AlertCircle size={16} />}
          <Box>
            <Text fontWeight='semibold'>
              {validationResult.isValid ? 'Configuration is valid' : 'Validation failed'}
            </Text>
            {validationResult.errors && (
              <VStack align='start' mt={2} gap={1}>
                {validationResult.errors.map((error, index) => (
                  <Text key={index} fontSize='sm'>• {error}</Text>
                ))}
              </VStack>
            )}
          </Box>
        </Alert>
      )}

      {applyResult && (
        <Alert status='success'>
          <Check size={16} />
          <Box>
            <Text fontWeight='semibold'>Configuration applied successfully</Text>
            <VStack align='start' mt={2} gap={1}>
              <Text fontSize='sm'>Version ID: <Badge variant='outline'>{applyResult.config_version_id}</Badge></Text>
              <Text fontSize='sm'>Applied at: {new Date(applyResult.applied_ts).toLocaleString()}</Text>
              {applyResult.changes.length > 0 && (
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>Changes:</Text>
                  {applyResult.changes.map((change, index) => (
                    <Text key={index} fontSize='sm' ml={4}>
                      • {change.type.toUpperCase()} {change.entity}: {change.name}
                    </Text>
                  ))}
                </Box>
              )}
            </VStack>
          </Box>
        </Alert>
      )}

      <HStack gap={3}>
        <Button
          variant='outline'
          onClick={handleValidate}
          isLoading={isLoading}
          leftIcon={<Check size={16} />}
          disabled={!yamlContent.trim()}
        >
          Validate
        </Button>
        
        <Button
          colorScheme='blue'
          onClick={handleApply}
          isLoading={isLoading}
          leftIcon={<Upload size={16} />}
          disabled={!yamlContent.trim() || (validationResult && !validationResult.isValid)}
        >
          Apply Configuration
        </Button>
      </HStack>
    </VStack>
  );
}