import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Accordion,
  IconButton,
  Flex,
  Collapsible,
  useBreakpointValue,
  Code,
} from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Alert } from '@/components/ui/alert';
import { FileText, Upload, Check, Download, Code2, ChevronLeft } from 'lucide-react';
import { configurationService } from '@/api/services/configuration.service';
import type { ConfigurationApplyResponse, ValidationError } from '@/api/types';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { ConfigurationDescription } from './ConfigurationDescription';

interface ConfigurationEditorProps {
  onConfigurationApplied?: (response: ConfigurationApplyResponse) => void;
}

export function ConfigurationEditor({ onConfigurationApplied }: ConfigurationEditorProps) {
  const { colorMode } = useColorMode();
  const [yamlContent, setYamlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors?: ValidationError[];
  } | null>(null);
  const [applyResult, setApplyResult] = useState<ConfigurationApplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const { ref: containerRef } = useResizeObserver<HTMLDivElement>();
  const defaultCollapsible = useBreakpointValue({ base: false, lg: true });
  const [isCollabsable, setIsCollabsable] = useState(!!defaultCollapsible);

  // Function to convert YAML path to line position for Monaco markers
  const findYamlPathPosition = (
    yamlText: string,
    path: string
  ): { line: number; column: number } => {
    const lines = yamlText.split('\n');

    // Parse path like "targets[0].group" or "groups[1].name"
    const pathParts = path.split('.');
    let currentLine = 1;

    try {
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];

        // Handle array notation like "targets[0]"
        const arrayMatch = part.match(/^([^[]+)\[(\d+)\]$/);
        if (arrayMatch) {
          const [, arrayName, indexStr] = arrayMatch;
          const index = parseInt(indexStr, 10);

          // Find the array declaration
          const arrayLineIndex = lines.findIndex(
            (line, idx) => idx >= currentLine - 1 && line.trim().startsWith(`${arrayName}:`)
          );
          if (arrayLineIndex === -1) break;

          // Find the specific array item
          let itemCount = 0;
          for (let j = arrayLineIndex + 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line.startsWith('-')) {
              if (itemCount === index) {
                currentLine = j + 1;
                break;
              }
              itemCount++;
            } else if (line && !line.startsWith(' ') && !line.startsWith('\t')) {
              break; // End of array
            }
          }
        } else {
          // Handle simple property like "group" or "name"
          const propertyLineIndex = lines.findIndex(
            (line, idx) =>
              idx >= currentLine - 1 &&
              (line.trim().startsWith(`${part}:`) || line.trim() === `${part}:`)
          );
          if (propertyLineIndex !== -1) {
            currentLine = propertyLineIndex + 1;
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing YAML path:', path, e);
    }

    return { line: currentLine, column: 1 };
  };

  // Function to set validation markers in Monaco editor
  const setValidationMarkers = (errors: any[]) => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = errors.map(error => {
      let position = { line: 1, column: 1 };
      let message = '';

      if (typeof error === 'string') {
        // Handle legacy string format
        const colonIndex = error.indexOf(':');
        const path = colonIndex > 0 ? error.substring(0, colonIndex).trim() : '';
        message = colonIndex > 0 ? error.substring(colonIndex + 1).trim() : error;

        if (path) {
          position = findYamlPathPosition(yamlContent, path);
        }
      } else {
        // Handle new structured ValidationError format
        message = error.message || 'Validation error';

        // Use structured line/column data if available
        if (error.line && error.column) {
          position = { line: error.line, column: error.column };
        } else if (error.path) {
          // Fall back to path-based positioning for schema validation errors
          position = findYamlPathPosition(yamlContent, error.path);
        }
      }

      return {
        severity: monacoRef.current.MarkerSeverity.Error,
        message: message,
        startLineNumber: position.line,
        startColumn: position.column,
        endLineNumber: position.line,
        endColumn: position.column + 10, // Highlight a few characters
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'yaml-validation', markers);
  };

  // Function to clear validation markers
  const clearValidationMarkers = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    monacoRef.current.editor.setModelMarkers(model, 'yaml-validation', []);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === 'application/x-yaml' ||
        file.name.endsWith('.yaml') ||
        file.name.endsWith('.yml'))
    ) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        setYamlContent(content);
        setValidationResult(null);
        setApplyResult(null);
        setError(null);
      };
      reader.readAsText(file!);
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
    clearValidationMarkers();

    try {
      const result = await configurationService.validateConfiguration(yamlContent);
      setValidationResult(result);
      if (result.isValid) {
        clearValidationMarkers();
      } else if (result.errors) {
        setValidationMarkers(result.errors);
      }
    } catch (err) {
      setError((err as Error).message);
      setValidationResult(null);
      clearValidationMarkers();
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

  const handleLoadCurrent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await configurationService.getCurrentConfiguration();
      setYamlContent(content);
      setValidationResult(null);
      setApplyResult(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load current configuration on component mount
  useEffect(() => {
    const loadCurrentConfig = async () => {
      try {
        const content = await configurationService.getCurrentConfiguration();
        setYamlContent(content);
      } catch (err) {
        console.warn('Could not load current configuration, using example:', err);
      }
    };

    loadCurrentConfig();
  }, []);

  useEffect(() => {
    setIsCollabsable(!!defaultCollapsible);
  }, [defaultCollapsible]);

  return (
    <VStack gap={3} align='stretch' h='full' w={'full'} ref={containerRef}>
      {/* Header*/}
      <HStack mt={2} flexShrink={0} justifyContent={'space-between'}>
        <HStack gap={3} align='center'>
          <FileText size={20} />
          <Heading size='md'>YAML Configuration Editor</Heading>
        </HStack>

        <HStack gap={2} alignItems={'center'} justifyContent={'flex-end'}>
          <Button variant='outline' size='sm' onClick={handleLoadCurrent} loading={isLoading}>
            <Download size={16} />
            Load Current Config
          </Button>
          <Button variant='outline' size='sm' onClick={handleLoadFromFile}>
            <Upload size={16} />
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
      </HStack>
      <Box display='flex' flex='1' overflow='hidden' gap={2}>
        {/* LEFT: Editor */}
        <VStack
          align='stretch'
          border='1px solid'
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          borderRadius='md'
          flex={3}
          minW='0'
        >
          <HStack
            bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
            h={9}
            align='center'
            gap={0}
            flexShrink={0}
          >
            <IconButton variant='ghost' color='green.500'>
              <Code2 size={16} />
            </IconButton>
            <Text fontSize='sm' fontWeight='semibold'>
              Editor
            </Text>
          </HStack>
          <Box flex='1' overflow='hidden'>
            <Editor
              height='100%'
              language='yaml'
              theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
              value={yamlContent}
              onChange={value => {
                setYamlContent(value || '');
                setValidationResult(null);
                setApplyResult(null);
                setError(null);
                clearValidationMarkers();
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </Box>
        </VStack>
        <ConfigurationDescription
          isCollabsable={isCollabsable}
          setIsCollabsable={setIsCollabsable}
        />
      </Box>
      <Flex w='full' align='center' gap={4}>
        <HStack flex='1' gap={4} align='stretch'>
          {error && <Alert flex='1' status='error' title={error} />}
          {!applyResult && validationResult && (
            <Alert
              flex='1'
              status={validationResult.isValid ? 'success' : 'error'}
              title={
                validationResult.isValid
                  ? 'Configuration is valid'
                  : `${validationResult.errors?.length || 0} error(s) found`
              }
            />
          )}
          {applyResult && (
            <Alert flex='1' status='success' title='Configuration applied successfully' />
          )}
        </HStack>
        <HStack gap={2}>
          <Button
            variant='outline'
            onClick={handleValidate}
            loading={isLoading}
            disabled={!yamlContent.trim()}
          >
            <Check size={16} />
            Validate
          </Button>
          <Button
            colorPalette='blue'
            onClick={handleApply}
            loading={isLoading}
            disabled={!yamlContent.trim() || validationResult?.isValid === false}
          >
            <Upload size={16} />
            Apply
          </Button>
        </HStack>
      </Flex>
    </VStack>
  );
}
