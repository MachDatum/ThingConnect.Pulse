import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Badge, Table } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { History, Download, FileText } from 'lucide-react';
import { configurationService } from '@/api/services/configuration.service';
import type { ConfigurationVersion } from '@/api/types';

interface ConfigurationVersionsProps {
  refreshTrigger?: number;
}

export function ConfigurationVersions({ refreshTrigger }: ConfigurationVersionsProps) {
  const [versions, setVersions] = useState<ConfigurationVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await configurationService.getVersions();
      const sortedVersions = data.sort(
        (a, b) => new Date(b.appliedTs).getTime() - new Date(a.appliedTs).getTime()
      );
      setVersions(sortedVersions);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (version: ConfigurationVersion) => {
    try {
      setDownloadingId(version.id);
      await configurationService.downloadVersion(version.id);
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
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
    <VStack gap={3} align='stretch' h='100%'>
      <Box mt={2}>
        <HStack gap={3} align='center' mb={2}>
          <History size={20} />
          <Heading size='md'>Configuration Versions</Heading>
        </HStack>
        <Text color='gray.600' _dark={{ color: 'gray.400' }} fontSize='sm'>
          History of applied YAML configurations with download and restore options
        </Text>
      </Box>
      {error && <Alert status='error' title={error} />}
      <Box flex='1' overflow='auto'>
        {versions.length === 0 ? (
          <Alert
            status='info'
            icon={<FileText size={16} />}
            title='No configuration versions found. Apply your first configuration to see version history.'
          />
        ) : (
          <Table.ScrollArea borderWidth='1px' rounded='md' height='100%'>
            <Table.Root size='sm' stickyHeader>
              <Table.Header>
                <Table.Row bg='gray.100' _dark={{ bg: 'gray.800' }}>
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
                      <Text fontSize='sm'>{formatTimestamp(version.appliedTs)}</Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text fontSize='xs' fontFamily='monospace' color='gray.600'>
                        {formatHash(version.fileHash)}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text fontSize='sm'>{version.actor || 'System'}</Text>
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
          </Table.ScrollArea>
        )}
      </Box>
      <Box flexShrink={0} mb={2}>
        <Alert title='Configuration Storage:'>
          Versions are automatically created when configurations are applied. Download any version
          to restore or compare configurations.
        </Alert>
      </Box>
    </VStack>
  );
}

