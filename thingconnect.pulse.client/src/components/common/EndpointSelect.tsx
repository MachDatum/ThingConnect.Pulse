import { useEffect, useState } from 'react';
import { Combobox, HStack, Portal, Span, Spinner, Skeleton } from '@chakra-ui/react';
import { useFilter, useListCollection } from '@chakra-ui/react';

type EndpointOption = {
  label: string;
  value: string;
};

interface EndpointSelectProps {
  items: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  error?: boolean;
  placeholder?: string;
  optionName?: string;
  defaultToFirst?: boolean;
}

export function EndpointSelect({
  items,
  selectedValue,
  onChange,
  isLoading = false,
  error = false,
  placeholder = 'Select endpoint...',
  optionName = '',
  defaultToFirst = false,
}: EndpointSelectProps) {
  const [cleared, setCleared] = useState(false);

  const itemsWithAll: EndpointOption[] =
    defaultToFirst && items.length > 0
      ? items
      : [{ label: `All ${optionName}`, value: '' }, ...items];

      console.log('Items with All option:', itemsWithAll);

  // Filtering
  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<EndpointOption>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: contains,
  });

  // Update collection whenever items change
  useEffect(() => {
    set(itemsWithAll);

    if (defaultToFirst && itemsWithAll.length > 0 && !selectedValue && !cleared) {
      console.log('Defaulting to first item:', itemsWithAll[0]);
      onChange(itemsWithAll[0].value);

    } else if (!defaultToFirst && !selectedValue && !cleared) {
      console.log('Defaulting to "All" option');
      onChange('');
    }
  }, [items, set, selectedValue, cleared, onChange]);

  return (
    <Skeleton loading={isLoading} w='md'>
      <Combobox.Root
        size='xs'
        w='xs'
        collection={collection}
        // value={selectedValue ? [selectedValue] : []}
        value={[selectedValue]}
        onValueChange={e => {
          onChange(e.value[0] ?? '');
          setCleared(false);
        }}
        onInputValueChange={e => filter(e.inputValue)}
        onOpenChange={open => {
          if (open) filter('');
        }}
        openOnClick
      >
        <Combobox.Control>
          <Combobox.Input placeholder={placeholder} />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger
              onClick={() => {
                onChange('');
                setCleared(true);
              }}
            />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content minW='sm'>
              {isLoading ? (
                <HStack p='2'>
                  <Spinner size='xs' borderWidth='1px' />
                  <Span>Loading endpoints...</Span>
                </HStack>
              ) : error ? (
                <Span p='2' color='fg.error'>
                  Failed to load endpoints
                </Span>
              ) : collection.items.length === 0 ? (
                <Combobox.Empty>No endpoints found</Combobox.Empty>
              ) : (
                collection.items.map(item => (
                  <Combobox.Item key={item.value} item={item}>
                    <HStack justify='space-between' textStyle='sm'>
                      {item.label}
                    </HStack>
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                ))
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Skeleton>
  );
}
