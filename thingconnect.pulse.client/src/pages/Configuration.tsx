import { useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfigurationEditor } from '@/components/config/ConfigurationEditor';
import { ConfigurationVersions } from '@/components/config/ConfigurationVersions';
import { Page } from '@/components/layout/Page';

export default function Configuration() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleConfigurationApplied = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page
      title='Configuration Management'
      description='Manage monitoring endpoints and YAML configuration'
      testId="configuration-page"
    >
      <TabsRoot defaultValue='editor' variant='enclosed'>
        <TabsList>
          <TabsTrigger value='editor'>
            <Text>YAML Editor</Text>
          </TabsTrigger>
          <TabsTrigger value='versions'>
            <Text>Version History</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='editor' py={4}>
          <ConfigurationEditor onConfigurationApplied={handleConfigurationApplied} />
        </TabsContent>

        <TabsContent value='versions' py={4}>
          <ConfigurationVersions refreshTrigger={refreshTrigger} />
        </TabsContent>
      </TabsRoot>

      <Box p={3} borderRadius='md' bg='blue.50' _dark={{ bg: 'blue.900' }}>
        <Text fontSize='sm' color='blue.800' _dark={{ color: 'blue.200' }}>
          <Text as='span' fontWeight='medium'>
            Configuration Storage:
          </Text>
          <br />
          Active configuration: C:\ProgramData\ThingConnect.Pulse\config.yaml
          <br />
          Version history: C:\ProgramData\ThingConnect.Pulse\versions\
        </Text>
      </Box>
    </Page>
  );
}
