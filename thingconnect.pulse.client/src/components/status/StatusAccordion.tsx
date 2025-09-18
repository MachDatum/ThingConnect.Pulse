import { Accordion, Box, Flex, HStack, Text } from '@chakra-ui/react';
import type { LiveStatusItem } from '@/api/types';
import { StatusTable } from './StatusTable';

type Props = {
  groupedEndpoints: Record<'up' | 'down' | 'flapping', LiveStatusItem[]>;
  isLoading: boolean;
};

export function StatusAccordion({ groupedEndpoints, isLoading }: Props) {
  return (
    <Accordion.Root multiple variant='plain'>
      {Object.entries(groupedEndpoints).map(([status, items]) => {
        const typedItems = items as LiveStatusItem[] | Record<string, LiveStatusItem[]>;
        const itemsArray = Array.isArray(typedItems)
          ? typedItems
          : Object.values(typedItems).flat();

        const statusColorMap: Record<'up' | 'down' | 'flapping', string> = {
          up: 'green',
          down: 'red',
          flapping: 'yellow',
        } as const;

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
                    textTransform='uppercase'
                    borderRadius='30px'
                    px={4}
                    py={1}
                    fontSize='11px'
                    alignItems='center'
                    justifyContent='center'
                    display='inline-flex'
                    color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                    _dark={{
                      bg: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.700`,
                      color: `${statusColorMap[status as 'up' | 'down' | 'flapping']}.200`,
                    }}
                  >
                    {status}
                  </Flex>
                  <Text
                    fontSize='sm'
                    fontWeight='semibold'
                    color={`${statusColorMap[status as 'up' | 'down' | 'flapping']}.600`}
                  >
                    {itemsArray?.length
                      ? itemsArray?.length > 1
                        ? `${itemsArray?.length} Endpoints`
                        : '1 Endpoint'
                      : 'No Endpoints'}
                  </Text>
                </HStack>
              </HStack>
            </Accordion.ItemTrigger>

            <Accordion.ItemContent borderWidth={1}>
              <Accordion.ItemBody>
                {itemsArray.length > 0 ? (
                  <Box pl={10}>
                    <StatusTable items={itemsArray} isLoading={isLoading} />
                  </Box>
                ) : (
                  <Box textAlign='center' color='gray.500' py={8} borderRadius='md'>
                    <Text>No endpoints available</Text>
                  </Box>
                )}
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
