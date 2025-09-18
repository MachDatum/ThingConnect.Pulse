import { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfigurationEditor } from '@/components/config/ConfigurationEditor';
import { ConfigurationVersions } from '@/components/config/ConfigurationVersions';
import { Page } from '@/components/layout/Page';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Configuration() {
  const analytics = useAnalytics();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    analytics.trackPageView('Configuration', {
      view_type: 'yaml_configuration',
      section: 'monitoring_setup'
    });
  }, []);

  const handleConfigurationApplied = () => {
    setRefreshTrigger(prev => prev + 1);
    
    // Track configuration change
    analytics.trackConfigurationChange('yaml_config_applied', {
      source: 'manual_edit',
      validation_passed: true
    });
  };

  return (
    <Page
      title='Configuration Management'
      description='Manage monitoring endpoints and YAML configuration'
      testId='configuration-page'
    >
      <TabsRoot
        defaultValue='editor'
        variant='enclosed'
        h='full'
        display='flex'
        flexDirection='column'
        w={'full'}
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
