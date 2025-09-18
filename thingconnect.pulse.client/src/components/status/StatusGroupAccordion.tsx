import { Accordion, Box, Flex, HStack, Text } from '@chakra-ui/react';
import type { LiveStatusItem } from '@/api/types';
import { StatusTable } from './StatusTable';

type Props = {
  groupedEndpoints: Record<'up' | 'down' | 'flapping', Record<string, LiveStatusItem[]>>;
  isLoading: boolean;
};

export function StatusGroupAccordion({ groupedEndpoints, isLoading }: Props) {
  return (
    <Accordion.Root multiple variant='plain'>
      {Object.entries(groupedEndpoints).map(([status, groupItems]) => {
        const totalEndpoints = Object.values(groupItems || {}).reduce(
          (sum, group) => sum + (group?.length || 0),
          0
        );
        const statusColorMap: Record<'up' | 'down' | 'flapping', string> = {
          up: 'green',
          down: 'red',
          flapping: 'yellow',
        } as const;

        // Narrow the type for TypeScript
        const typedGroupItems = groupItems || {};

        return (
          <Accordion.Item key={status} value={status} my={2}>
            <Accordion.ItemTrigger
              bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.100`}
              _dark={{
                bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.900`,
                borderColor: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.800`,
              }}
              borderColor={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
              borderWidth={1}
            >
              <HStack w='full' justify='space-between'>
                <HStack px={'10px'}>
                  <Accordion.ItemIndicator
                    fontSize={'md'}
                    fontWeight={'bolder'}
                    color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                  />
                  <Flex
                    as='span'
                    bg={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`}
                    color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                    _dark={{
                      bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.700`,
                      color: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`,
                    }}
                    textTransform='uppercase'
                    borderRadius='30px'
                    px={4}
                    py={1}
                    fontSize='11px'
                    alignItems='center'
                    justifyContent='center'
                    display='inline-flex'
                  >
                    {status}
                  </Flex>
                  <Text
                    fontSize='sm'
                    fontWeight='semibold'
                    color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                  >
                    {totalEndpoints ? `${totalEndpoints} Endpoints` : 'No Endpoints'}
                  </Text>
                </HStack>
              </HStack>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent borderWidth={1} borderRadius={1}>
              <Accordion.ItemBody py={0}>
                <Accordion.Root multiple variant='plain' pl={4}>
                  {Object.entries(typedGroupItems).map(([group, items]) => (
                    <Accordion.Item key={group} value={group}>
                      <Accordion.ItemTrigger>
                        <HStack w='full' justify='space-between'>
                          <HStack px={'10px'}>
                            <Accordion.ItemIndicator fontSize={'md'} fontWeight={'bolder'} />
                            <Text fontSize='sm' fontWeight='semibold' pl={4}>
                              {group}
                            </Text>
                            <Text fontSize='12px' color={'gray.400'} px={2}>
                              {items?.length
                                ? items?.length > 1
                                  ? `${items?.length} Endpoints`
                                  : '1 Endpoint'
                                : 'No Endpoints'}
                            </Text>
                          </HStack>
                        </HStack>
                      </Accordion.ItemTrigger>

                      <Accordion.ItemContent borderLeftWidth={1} borderRadius={2} ml={5}>
                        <Accordion.ItemBody pl={6} py={0}>
                          {items && items.length > 0 ? (
                            <StatusTable items={items} isLoading={isLoading} />
                          ) : (
                            <Box textAlign='center' color='gray.500' py={8} borderRadius='md'>
                              <Text>No endpoints available</Text>
                            </Box>
                          )}
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
