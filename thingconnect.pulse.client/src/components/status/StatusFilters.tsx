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
    <Box
      position={{ base: 'sticky', md: 'static' }}
      top={{ base: '0', md: 'auto' }}
      zIndex={{ base: 10, md: 'auto' }}
      bg={{ base: 'white', md: 'transparent' }}
      _dark={{
        bg: { base: 'gray.800', md: 'transparent' },
        borderColor: { base: 'gray.700', md: 'transparent' },
      }}
      py={{ base: 3, md: 0 }}
      px={{ base: 4, md: 0 }}
      mx={{ base: -4, md: 0 }}
      borderBottom={{ base: '1px', md: 'none' }}
      borderColor={{
        base: 'gray.200',
        md: 'transparent',
        _dark: { base: 'gray.700', md: 'transparent' },
      }}
      data-testid='status-filters'
    >
      <HStack gap={{ base: 2, md: 4 }} align='center' flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        {/* Group Filter */}
        <Box minW={{ base: '150px', md: '200px' }} flex={{ base: '1', md: 'none' }}>
          <NativeSelect.Root data-testid='group-filter'>
            <NativeSelect.Field
              value={filters.group || ''}
              onChange={e => handleGroupChange(e.target.value)}
              placeholder='All Groups'
              minHeight='44px'
              fontSize={{ base: 'sm', md: 'md' }}
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
        <Box flex='1' maxW={{ base: '100%', md: '400px' }} position='relative' w='100%'>
          <Input
            placeholder='Search endpoints by name or host...'
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            data-testid='search-input'
            pl='10'
            minHeight='44px'
            fontSize={{ base: 'sm', md: 'md' }}
          />
          <Box position='absolute' left='3' top='50%' transform='translateY(-50%)' color='gray.400'>
            <Search size={16} />
          </Box>
        </Box>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant='outline'
            size={{ base: 'sm', md: 'md' }}
            onClick={clearFilters}
            data-testid='clear-filters'
            minHeight='44px'
            flexShrink={0}
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </HStack>
    </Box>
  );
}
