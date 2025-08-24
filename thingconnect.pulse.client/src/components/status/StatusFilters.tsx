import { HStack, Input, Button, Box, NativeSelect } from '@chakra-ui/react';
import { Search, X } from 'lucide-react';
import type { LiveStatusParams } from '@/api/types';

const DEFAULT_GROUPS: string[] = [];

interface StatusFiltersProps {
  filters: LiveStatusParams;
  onFiltersChange: (filters: LiveStatusParams) => void;
  groups?: string[];
}

export function StatusFilters({
  filters,
  onFiltersChange,
  groups = DEFAULT_GROUPS,
}: StatusFiltersProps) {
  const handleGroupChange = (value: string) => {
    onFiltersChange({
      ...filters,
      group: value || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  const hasFilters = filters.group || filters.search;

  return (
    <HStack gap={4} align='center' data-testid='status-filters'>
      {/* Group Filter */}
      <Box minW='200px'>
        <NativeSelect.Root data-testid='group-filter'>
          <NativeSelect.Field
            value={filters.group || ''}
            onChange={e => handleGroupChange(e.target.value)}
            placeholder='All Groups'
          >
            <option value=''>All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Box>

      {/* Search Input */}
      <Box flex='1' maxW='400px' position='relative'>
        <Input
          placeholder='Search endpoints by name or host...'
          value={filters.search || ''}
          onChange={e => handleSearchChange(e.target.value)}
          data-testid='search-input'
          pl='10'
        />
        <Box position='absolute' left='3' top='50%' transform='translateY(-50%)' color='gray.400'>
          <Search size={16} />
        </Box>
      </Box>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant='outline' size='sm' onClick={clearFilters} data-testid='clear-filters'>
          <X size={16} />
          Clear
        </Button>
      )}
    </HStack>
  );
}
