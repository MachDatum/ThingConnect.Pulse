import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Table
} from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { History, Download, FileText, Clock } from 'lucide-react';
import { configService } from '@/api/services/config.service';
import type { ConfigVersion } from '@/api/types';

interface ConfigVersionsProps {
  refreshTrigger?: number;
}

export function ConfigVersions({ refreshTrigger }: ConfigVersionsProps) {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await configService.getVersions();
      // Sort by applied timestamp descending (most recent first)
      const sortedVersions = data.sort((a, b) => 
        new Date(b.applied_ts).getTime() - new Date(a.applied_ts).getTime()
      );
      setVersions(sortedVersions);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (version: ConfigVersion) => {
    try {
      setDownloadingId(version.id);
      await configService.downloadVersion(version.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [refreshTrigger]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return hash ? hash.substring(0, 8) + '...' : '—';
  };

  if (isLoading) {
    return (
      <VStack gap={4} align='center' p={8}>
        <Text>Loading configuration versions...</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align='stretch'>
      <Box>
        <HStack gap={3} align='center' mb={2}>
          <History size={20} />
          <Heading size='md'>Configuration Versions</Heading>
        </HStack>
        <Text color='gray.600' _dark={{ color: 'gray.400' }} fontSize='sm'>
          History of applied YAML configurations with download and restore options
        </Text>
      </Box>

      {error && (
        <Alert status='error'>
          <FileText size={16} />
          <Text>{error}</Text>
        </Alert>
      )}

      {versions.length === 0 ? (
        <Alert status='info'>
          <FileText size={16} />
          <Text>No configuration versions found. Apply your first configuration to see version history.</Text>
        </Alert>
      ) : (
        <Box overflowX='auto'>
          <Table.Root variant='simple' size='sm'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Version</Table.ColumnHeader>
                <Table.ColumnHeader>Applied Date</Table.ColumnHeader>
                <Table.ColumnHeader>Hash</Table.ColumnHeader>
                <Table.ColumnHeader>Actor</Table.ColumnHeader>
                <Table.ColumnHeader>Notes</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {versions.map((version, index) => (
                <Table.Row key={version.id}>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Badge 
                        colorScheme={index === 0 ? 'green' : 'gray'}
                        variant={index === 0 ? 'solid' : 'outline'}
                      >
                        {index === 0 ? 'CURRENT' : `v${versions.length - index}`}
                      </Badge>
                      <Text fontSize='xs' color='gray.500' fontFamily='monospace'>
                        {version.id.substring(0, 8)}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <VStack align='start' gap={0}>
                      <Text fontSize='sm'>{formatTimestamp(version.applied_ts)}</Text>
                      <HStack gap={1}>
                        <Clock size={12} />
                        <Text fontSize='xs' color='gray.500'>
                          {new Date(version.applied_ts).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontSize='xs' fontFamily='monospace' color='gray.600'>
                      {formatHash(version.file_hash)}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontSize='sm'>
                      {version.actor || 'System'}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                      {version.note || '—'}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <HStack gap={2}>
                      <Button
                        size='xs'
                        variant='outline'
                        onClick={() => handleDownload(version)}
                        loading={downloadingId === version.id}
                        title='Download YAML configuration'
                      >
                        <Download size={12} />
                        Download
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {versions.length > 0 && (
        <Box p={4} borderRadius='md' bg='blue.50' _dark={{ bg: 'blue.900' }}>
          <Text fontSize='sm' color='blue.800' _dark={{ color: 'blue.200' }}>
            <strong>Configuration Storage:</strong>
            <br />
            Versions are automatically created when configurations are applied.
            Download any version to restore or compare configurations.
          </Text>
        </Box>
      )}
    </VStack>
  );
}