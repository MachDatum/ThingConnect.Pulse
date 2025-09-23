import {
  HStack,
  Input,
  Icon,
  Portal,
  Select,
  createListCollection,
  InputGroup,
  CloseButton,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { UsersListParams } from '@/api/types';

interface UserFiltersProps {
  onFilterChange: (filters: UsersListParams) => void;
  loading?: boolean;
}

export function UserFilters({ onFilterChange, loading = false }: UserFiltersProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange();
    }, 500);

    return () => clearTimeout(handler);
  }, [search, role, isActive]);

  const handleFilterChange = useCallback(() => {
    const filters: UsersListParams = { page: 1 };
    if (search.trim()) filters.search = search.trim();
    if (role) filters.role = role;
    if (isActive !== '') filters.isActive = isActive === 'true';
    onFilterChange(filters);
  }, [search, role, isActive, onFilterChange]);

  return (
    <HStack>
      <InputGroup
        startElement={<Icon as={Search} color='gray.400' boxSize={4} />}
        endElement={
          search ? (
            <CloseButton
              size='xs'
              me='-2'
              onClick={() => {
                setSearch('');
                inputRef.current?.focus();
              }}
            />
          ) : undefined
        }
      >
        <Input
          ref={inputRef}
          placeholder='Search by username or email...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFilterChange()}
          _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          size='sm'
        />
      </InputGroup>

      {/* Role Filter */}
      <Select.Root
        collection={roleOptions}
        value={[role]}
        onValueChange={e => setRole(e.value[0] ?? '')}
        size='sm'
        disabled={loading}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder='All Roles' />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.ClearTrigger />
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {roleOptions.items.map(opt => (
                <Select.Item key={opt.value} item={opt}>
                  {opt.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {/* Status Filter */}
      <Select.Root
        collection={statusOptions}
        value={[isActive]}
        onValueChange={e => setIsActive(e.value[0] ?? '')}
        size='sm'
        disabled={loading}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder='All Status' />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.ClearTrigger />
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {statusOptions.items.map(opt => (
                <Select.Item key={opt.value} item={opt}>
                  {opt.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </HStack>
  );
}

/* Collections for Select */
const roleOptions = createListCollection({
  items: [
    { label: 'All Roles', value: '' },
    { label: 'Administrator', value: 'Administrator' },
    { label: 'User', value: 'User' },
  ],
});

const statusOptions = createListCollection({
  items: [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ],
});
