import { useEffect, useMemo, type ComponentProps } from 'react';
import { Combobox, HStack, Portal, Span, Spinner, Skeleton } from '@chakra-ui/react';
import { useFilter, useListCollection } from '@chakra-ui/react';

type Option = {
  label: string;
  value: string;
};

interface ComboboxProps extends Omit<ComponentProps<typeof Combobox.Root>, 'onChange' | 'children' | 'value' | 'collection'
> {
  items: Option[];
  selectedValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function ComboboxSelect({
  items,
  selectedValue = '',
  onChange,
  placeholder = 'Select an option',
  isLoading = false,
  ...rest
}: ComboboxProps) {

  const itemsWithAll = useMemo(() => {
    return items.length > 0 
      ? [{ label: 'All', value: '' }, ...items] 
      : items;
  }, [items]);

  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<Option>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: contains,
  });

  useEffect(() => {
    set(itemsWithAll);
  }, [itemsWithAll, set]);

  return (
    <Skeleton loading={isLoading} w='md'>
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