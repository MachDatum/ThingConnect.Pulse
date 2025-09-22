import { useEffect, useMemo, type ComponentProps } from 'react';
import { Combobox, HStack, Portal, Span, Spinner, Skeleton, Text, Button } from '@chakra-ui/react';
import { useFilter, useListCollection } from '@chakra-ui/react';

type Option = {
  label: string;
  value: string;
};

export interface ComboboxProps
  extends Omit<
    ComponentProps<typeof Combobox.Root>,
    'onChange' | 'children' | 'value' | 'collection' | 'multiple'
  > {
  items: Option[];
  selectedValue?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  defaultToFirst?: boolean;
  isMulti?: boolean;
}

export function ComboboxSelect({
  items,
  selectedValue = '',
  onChange,
  placeholder = 'Select an option',
  isLoading = false,
  defaultToFirst = false,
  isMulti = false,
  ...rest
}: ComboboxProps) {
  const itemsWithAll = useMemo(() => items, [items]);

  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<Option>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: contains,
  });

  useEffect(() => {
    set(itemsWithAll);

    if (defaultToFirst && !selectedValue && itemsWithAll.length > 0) {
      onChange(isMulti ? [itemsWithAll[0].value] : itemsWithAll[0].value);
    }
  }, [itemsWithAll, set, defaultToFirst, selectedValue, onChange, isMulti]);

  return (
    <Skeleton loading={isLoading} w='full'>
      <Combobox.Root
        size='md'
        w='xs'
        collection={collection}
        value={Array.isArray(selectedValue) ? selectedValue : [selectedValue]}
        multiple={isMulti}
        closeOnSelect={!isMulti}
        onValueChange={e => {
          const newValue = isMulti ? e.value : (e.value[0] ?? '');
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
              isMulti
                ? collection.items
                    .filter(item => (selectedValue as string[]).includes(item.value))
                    .map(i => i.label)
                    .join(', ')
                : collection.items.find(item => item.value === selectedValue)?.label || ''
            }
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger onClick={() => onChange(isMulti ? [] : '')} />
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
                <>
                  {isMulti && (
                    <HStack justify='flex-start' colorPalette={'blue'} gap={0}>
                      <Button
                        size='2xs'
                        variant='plain'
                        onClick={() => onChange(collection.items.map(i => i.value))}
                        textDecoration='underline'
                        fontWeight={'light'}
                      >
                        Select All
                      </Button>
                      <Button
                        size='2xs'
                        variant='plain'
                        onClick={() => onChange([])}
                        textDecoration='underline'
                        fontWeight={'light'}
                      >
                        <Text>Clear All</Text>
                      </Button>
                    </HStack>
                  )}
                  {collection.items.map(item => (
                    <Combobox.Item key={item.value} item={item}>
                      <HStack justify='space-between' textStyle='sm'>
                        {item.label}
                      </HStack>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))}
                </>
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Skeleton>
  );
}
