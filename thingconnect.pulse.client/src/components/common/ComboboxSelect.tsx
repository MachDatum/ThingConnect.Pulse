import { useEffect, useMemo, type ComponentProps } from 'react';
import { Combobox, HStack, Portal, Span, Spinner, Skeleton } from '@chakra-ui/react';
import { useFilter, useListCollection } from '@chakra-ui/react';

type Option = {
  label: string;
  value: string;
};

export interface ComboboxProps extends Omit<ComponentProps<typeof Combobox.Root>, 'onChange' | 'children' | 'value' | 'collection'
> {
  items: Option[];
  selectedValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  defaultToFirst?: boolean;
}

export function ComboboxSelect({
  items,
  selectedValue = '',
  onChange,
  placeholder = 'Select an option',
  isLoading = false,
  defaultToFirst = false,
  ...rest
}: ComboboxProps) {

   const itemsWithAll = useMemo(() => {
    return items.length > 0 && !defaultToFirst
      ? [{ label: 'All', value: '' }, ...items]
      : items;
  }, [items, defaultToFirst]);

  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<Option>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: contains,
  });

  useEffect(() => {
    // Always update the collection
    set(itemsWithAll);

    // If defaultToFirst is true and nothing is selected yet, pick the first option
    if (defaultToFirst && !selectedValue && itemsWithAll.length > 0) {
      onChange(itemsWithAll[0].value);
    }
  }, [itemsWithAll, set, defaultToFirst, selectedValue, onChange]);

  return (
    <Skeleton loading={isLoading} w='full'>
      <Combobox.Root
        size='md'
        w='xs'
        collection={collection}
        value={[selectedValue]}
        onValueChange={e => {
          const newValue = e.value[0] ?? '';
          onChange(newValue);
        }}
        onInputValueChange={e => filter(e.inputValue)}
        onOpenChange={open => {
          if (open) filter('');
        }}
        openOnClick
        {...rest}
      >
        <Combobox.Control>
          <Combobox.Input 
            placeholder={placeholder || 'Select an option'} 
            value={
              collection.items.find((item) => item.value === selectedValue)?.label || ''
            }
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger
              onClick={() => {
                onChange('');
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
                  <Span>Loading...</Span>
                </HStack>
              ) : collection.items.length === 0 ? (
                <Combobox.Empty>No options found</Combobox.Empty>
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