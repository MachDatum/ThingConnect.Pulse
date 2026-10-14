import { useEffect, useMemo, type ComponentProps } from 'react';
import {
  Box,
  Button,
  Combobox,
  HStack,
  Portal,
  Skeleton,
  Span,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useFilter, useListCollection } from '@chakra-ui/react';
import { Check } from 'lucide-react';

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

/** Visual-only checkbox: the Combobox.Item itself handles the toggle, so no nested input. */
function CheckboxMark({ checked }: { checked: boolean }) {
  return (
    <Box
      boxSize='4'
      flexShrink={0}
      borderRadius='sm'
      borderWidth='1.5px'
      borderColor={checked ? 'blue.solid' : 'border.emphasized'}
      bg={checked ? 'blue.solid' : 'transparent'}
      color='blue.contrast'
      display='flex'
      alignItems='center'
      justifyContent='center'
      transition='background 0.1s, border-color 0.1s'
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </Box>
  );
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
  const selected = useMemo(
    () => (Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []),
    [selectedValue]
  );

  const filters = useFilter({ sensitivity: 'base' });
  const { collection, set, filter } = useListCollection<Option>({
    initialItems: [],
    itemToString: item => item.label,
    itemToValue: item => item.value,
    filter: (itemText, filterText) => filters.contains(itemText, filterText),
  });

  useEffect(() => {
    set(itemsWithAll);

    if (defaultToFirst && !selectedValue && itemsWithAll.length > 0) {
      onChange(isMulti ? [itemsWithAll[0].value] : itemsWithAll[0].value);
    }
  }, [itemsWithAll, set, defaultToFirst, selectedValue, onChange, isMulti]);

  // Multi-select: the input is only a search box; when empty it shows what is selected.
  const selectedLabels = itemsWithAll.filter(i => selected.includes(i.value)).map(i => i.label);
  const multiSummary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels[0]} +${selectedLabels.length - 1} more`;

  return (
    <Skeleton loading={isLoading} w='full'>
      <Combobox.Root
        size='md'
        w='xs'
        collection={collection}
        value={selected}
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
          {isMulti ? (
            <Combobox.Input
              placeholder={multiSummary}
              title={selectedLabels.join(', ')}
              _placeholder={{ color: selectedLabels.length > 0 ? 'fg' : 'fg.subtle' }}
            />
          ) : (
            <Combobox.Input
              placeholder={placeholder || 'Select an option'}
              value={collection.items.find(item => item.value === selectedValue)?.label || ''}
            />
          )}
          <Combobox.IndicatorGroup>
            {selected.length > 0 && (
              <Combobox.ClearTrigger onClick={() => onChange(isMulti ? [] : '')} />
            )}
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content
              minW='sm'
              bg={{ base: 'white', _dark: 'gray.800' }}
              borderWidth='1px'
              borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
              boxShadow='lg'
              p={1}
            >
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
                    <HStack
                      justify='space-between'
                      px={2}
                      py={1.5}
                      mb={1}
                      borderBottomWidth='1px'
                      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
                    >
                      <Text fontSize='xs' color='fg.muted'>
                        {selected.length === 0
                          ? `${itemsWithAll.length} options`
                          : `${selected.length} of ${itemsWithAll.length} selected`}
                      </Text>
                      <HStack gap={1} colorPalette='blue'>
                        <Button
                          size='2xs'
                          variant='ghost'
                          onClick={() => onChange(collection.items.map(i => i.value))}
                        >
                          Select all
                        </Button>
                        <Button
                          size='2xs'
                          variant='ghost'
                          colorPalette='gray'
                          onClick={() => onChange([])}
                          disabled={selected.length === 0}
                        >
                          Clear
                        </Button>
                      </HStack>
                    </HStack>
                  )}
                  {collection.items.map(item => {
                    const checked = selected.includes(item.value);
                    return (
                      <Combobox.Item
                        key={item.value}
                        item={item}
                        borderRadius='sm'
                        _highlighted={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                      >
                        {isMulti ? (
                          <HStack gap={2.5} textStyle='sm'>
                            <CheckboxMark checked={checked} />
                            <Text fontWeight={checked ? 'medium' : 'normal'}>{item.label}</Text>
                          </HStack>
                        ) : (
                          <>
                            <HStack justify='space-between' textStyle='sm'>
                              {item.label}
                            </HStack>
                            <Combobox.ItemIndicator />
                          </>
                        )}
                      </Combobox.Item>
                    );
                  })}
                </>
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Skeleton>
  );
}
