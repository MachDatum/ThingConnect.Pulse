import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wrench } from 'lucide-react';
import { ConfigurationEditor } from '@/components/config/ConfigurationEditor';
import { ConfigurationVersions } from '@/components/config/ConfigurationVersions';

export default function Configuration() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleConfigurationApplied = () => {
    // Trigger refresh of versions list when config is applied
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <VStack gap={6} align='stretch' data-testid='configuration-page'>
      <Box>
        <HStack gap={3} align='center'>
          <Wrench size={24} />
          <Box>
            <Heading size='lg' color='blue.600' _dark={{ color: 'blue.400' }}>
              Configuration Management
            </Heading>
            <Text color='gray.600' _dark={{ color: 'gray.400' }}>
              Manage monitoring endpoints and YAML configuration
            </Text>
          </Box>
        </HStack>
      </Box>

      <TabsRoot defaultValue='editor' variant='enclosed'>
        <TabsList>
          <TabsTrigger value='editor'>
            <Text>YAML Editor</Text>
          </TabsTrigger>
          <TabsTrigger value='versions'>
            <Text>Version History</Text>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value='editor' py={6}>
          <ConfigurationEditor onConfigurationApplied={handleConfigurationApplied} />
        </TabsContent>
        
        <TabsContent value='versions' py={6}>
          <ConfigurationVersions refreshTrigger={refreshTrigger} />
        </TabsContent>
      </TabsRoot>

      <Box p={4} borderRadius='md' bg='blue.50' _dark={{ bg: 'blue.900' }}>
        <Text fontSize='sm' color='blue.800' _dark={{ color: 'blue.200' }}>
          <strong>Configuration Storage:</strong>
          <br />
          Active configuration: C:\ProgramData\ThingConnect.Pulse\config.yaml
          <br />
          Version history: C:\ProgramData\ThingConnect.Pulse\versions\
        </Text>
      </Box>
    </VStack>
  );
}
