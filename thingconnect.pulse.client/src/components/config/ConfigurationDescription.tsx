import { Box, HStack, Text, Accordion, Collapsible, Code, Flex } from '@chakra-ui/react';
import { FileText, ChevronLeft } from 'lucide-react';
import { useColorMode } from '@/components/ui/color-mode';

interface ConfigurationDescriptionProps {
  isCollabsable: boolean;
  setIsCollabsable: (value: boolean) => void;
}

export function ConfigurationDescription({
  isCollabsable,
  setIsCollabsable,
}: ConfigurationDescriptionProps) {
  const { colorMode } = useColorMode();

  return (
    <Collapsible.Root
      open={isCollabsable}
      onOpenChange={() => setIsCollabsable(!isCollabsable)}
      flex={isCollabsable ? '1' : 'none'}
      overflow={'auto'}
    >
      <Collapsible.Content
        border='1px solid'
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        rounded='md'
        h='full'
        w='full'
        display='flex'
        flexDirection='column'
      >
        {/* Sticky Header */}
        <HStack
          bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
          h={9}
          align='center'
          justify='space-between'
          position='sticky'
          top={0}
          zIndex={10}
          px={2}
        >
          <HStack align='center' gap={1}>
            <FileText size={16} color={colorMode === 'dark' ? '#63b3ed' : '#3182ce'} />
            <Text fontSize='sm' fontWeight='semibold'>
              Description
            </Text>
          </HStack>
          <Collapsible.Trigger
            p='2'
            rounded='md'
            cursor='pointer'
            display='flex'
            alignItems='center'
            justifyContent='center'
            _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.200' }}
          >
            <ChevronLeft size={16} />
          </Collapsible.Trigger>
        </HStack>
        <Box flex='1' overflow='auto' px={3} py={2}>
          <Accordion.Root multiple collapsible>
            {/* 1. Schema Overview */}
            <Accordion.Item value='schema'>
              <Accordion.ItemTrigger>
                <Text>1. Schema Overview</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>
                    The configuration file has a <b>version</b> and <b>global defaults</b>. Defaults
                    apply to all targets unless overridden.
                  </Text>
                  <Text fontSize='sm' mt={2}>
                    Example:
                  </Text>
                  <Code
                    p={2}
                    w='full'
                    rounded='md'
                    colorScheme='blue'
                    whiteSpace='pre-wrap'
                    _dark={{ bg: 'gray.800' }}
                  >
                    {`version: 1
defaults:
  interval_seconds: 10
  timeout_ms: 1500
  retries: 1`}
                  </Code>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* 2. Groups */}
            <Accordion.Item value='groups'>
              <Accordion.ItemTrigger>
                <Text>2. Groups</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>
                    Groups help organize devices logically. Each group can have:
                  </Text>
                  <Box as='ul' fontSize='sm' pl={0} style={{ listStyleType: 'none' }}>
                    <li>
                      <b>id</b> – unique identifier
                    </li>
                    <li>
                      <b>name</b> – display name
                    </li>
                    <li>
                      <b>parent_id</b> – optional parent group
                    </li>
                    <li>
                      <b>color</b> – for easy visual identification
                    </li>
                    <li>
                      <b>sort_order</b> – order in UI lists
                    </li>
                  </Box>
                  <Text fontSize='sm' mt={2}>
                    Example:
                  </Text>
                  <Code
                    p={2}
                    w='full'
                    rounded='md'
                    colorScheme='green'
                    whiteSpace='pre-wrap'
                    _dark={{ bg: 'gray.800' }}
                  >
                    {`- id: production-floor
  name: "Production Floor"
  color: "#2E7D32"
  sort_order: 10`}
                  </Code>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* 3. Targets */}
            <Accordion.Item value='targets'>
              <Accordion.ItemTrigger>
                <Text>3. Targets</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>
                    Targets define what to monitor (ICMP, TCP, HTTP/HTTPS). You can override
                    defaults per target.
                  </Text>
                  <Text fontSize='sm' mt={2}>
                    Example - ICMP target:
                  </Text>
                  <Code
                    p={2}
                    w='full'
                    rounded='md'
                    colorScheme='orange'
                    whiteSpace='pre-wrap'
                    _dark={{ bg: 'gray.800' }}
                  >
                    {`- type: icmp
  host: plc-press-01.factory.local
  group: press-shop
  name: "PLC Press 01"
  notes: "Critical production PLC"`}
                  </Code>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* 4. Advanced Options */}
            <Accordion.Item value='advanced'>
              <Accordion.ItemTrigger>
                <Text>4. Advanced Options</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>Optional fields to fine-tune monitoring:</Text>
                  <Box as='ul' fontSize='sm' pl={0} style={{ listStyleType: 'none' }}>
                    <ul>
                      <li>
                        <b>enabled</b> - temporarily disable a target
                      </li>
                      <li>
                        <b>notes</b> - add descriptive notes
                      </li>
                      <li>
                        <b>expected_rtt_ms</b> - expected response time in ms
                      </li>
                    </ul>
                  </Box>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* 5. Best Practices */}
            <Accordion.Item value='best-practices'>
              <Accordion.ItemTrigger>
                <Text>5. Best Practices</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>Keep your configuration clean and efficient:</Text>
                  <Box as='ul' fontSize='sm' pl={0} style={{ listStyleType: 'none' }}>
                    <ul>
                      <li>Group related devices together.</li>
                      <li>Use short intervals for critical devices.</li>
                      <li>Use longer intervals for large networks.</li>
                      <li>
                        Disable targets during maintenance using <b>enabled: false</b>
                      </li>
                    </ul>
                  </Box>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* 6. Common Pitfalls */}
            <Accordion.Item value='pitfalls'>
              <Accordion.ItemTrigger>
                <Text>6. Common Pitfalls</Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Text fontSize='sm'>Avoid mistakes that break monitoring:</Text>
                  <Box as='ul' fontSize='sm' pl={0} style={{ listStyleType: 'none' }}>
                    <ul>
                      <li>Use spaces, not tabs, in YAML</li>
                      <li>Ensure unique group IDs</li>
                      <li>Check hostnames/IPs for correctness</li>
                    </ul>
                  </Box>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </Box>
      </Collapsible.Content>

      {!isCollabsable && (
        <Collapsible.Trigger
          w='28px'
          h='full'
          bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
          border='1px solid'
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          rounded='md'
          cursor='pointer'
          _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.200' }}
        >
          <Flex transform='rotate(-90deg)' gap={2}>
            <Box color={'blue.400'}>
              <FileText size={16} />
            </Box>
            <Text fontSize={'sm'} fontWeight={'semibold'}>
              Description
            </Text>
          </Flex>
        </Collapsible.Trigger>
      )}
    </Collapsible.Root>
  );
}
