import { Accordion, Box, HStack, Text } from '@chakra-ui/react';
import type { LiveStatusItem } from '@/api/types';
import { StatusTable } from './StatusTable';

type Props = {
  groupedEndpoints: Record<string, LiveStatusItem[]>;
  isLoading: boolean;
};

export function GroupAccordion({ groupedEndpoints, isLoading }: Props) {
  return (
    <Accordion.Root multiple variant='plain'>
      {Object.entries(groupedEndpoints).map(([group, items]) => {
        const typedItems = items as LiveStatusItem[] | Record<string, LiveStatusItem[]>;
        const itemsArray = Array.isArray(typedItems)
          ? typedItems
          : Object.values(typedItems).flat();

        return (
          <Accordion.Item key={group} value={group} my={2}>
            <Accordion.ItemTrigger borderWidth={1} _dark={{ borderColor: 'gray.200' }}>
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
            <Accordion.ItemContent borderWidth={1}>
              <Accordion.ItemBody>
                <Box pl={10}>
                  <StatusTable items={itemsArray} isLoading={isLoading} />
                </Box>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
