import { useState } from 'react';
import { Text } from '@chakra-ui/react';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfigurationEditor } from '@/components/config/ConfigurationEditor';
import { ConfigurationVersions } from '@/components/config/ConfigurationVersions';
import { Page } from '@/components/layout/Page';
import { HelpButton } from '@/components/common/HelpButton';

export default function Configuration() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleConfigurationApplied = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page
      title='Configuration Management'
      description='Manage monitoring endpoints and YAML configuration'
      testId='configuration-page'
      actions={
        <HelpButton
          helpUrl="https://docs.thingconnect.io/pulse/user-guide/configuration"
          tooltip="Configuration Help"
        />
      }
    >
      <TabsRoot
        defaultValue='editor'
        variant='enclosed'
        h='full'
        display='flex'
        flexDirection='column'
      >
        <TabsList flexShrink={0} _dark={{ bg: 'gray.700' }}>
          <TabsTrigger value='editor'>
            <Text>YAML Editor</Text>
          </TabsTrigger>
          <TabsTrigger value='versions'>
            <Text>Version History</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='editor' py={1} flex={1} overflow='hidden'>
          <ConfigurationEditor onConfigurationApplied={handleConfigurationApplied} />
        </TabsContent>
        <TabsContent value='versions' py={1} flex={1} overflow='auto'>
          <ConfigurationVersions refreshTrigger={refreshTrigger} />
        </TabsContent>
      </TabsRoot>
    </Page>
  );
}
