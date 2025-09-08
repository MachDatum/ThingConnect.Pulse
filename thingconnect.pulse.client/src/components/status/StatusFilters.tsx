import { HStack, Input, Button, Box, Flex, Icon, Menu } from '@chakra-ui/react';
import { X } from 'lucide-react';
import type { LiveStatusParams } from '@/api/types';
import { MdSearch, MdExpandMore } from 'react-icons/md';

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
        _dark: { base: 'gray.700', md: 'transparent' }
      }}
      data-testid='status-filters'
    >
      <HStack gap={{ base: 2, md: 4 }} align='center' flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        {/* Group Filter */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant='outline' borderColor='gray.300'>
              {filters.group || 'All Groups'}
              <MdExpandMore />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item key={'all'} value={''} onSelect={() => handleGroupChange('')}>
                All Groups
              </Menu.Item>
              {groups.map(group => (
                <Menu.Item key={group} value={group} onSelect={() => handleGroupChange(group)}>
                  {group}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        {/* Search Input */}
        <Flex align='center' position='relative' >
          <Icon as={MdSearch} position='absolute' left='3' color='gray.400' />
          <Input
            placeholder='Search endpoints by name or host...'
            ps='10'
            pe='4'
            w='80'
            borderColor='gray.300'
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            data-testid='search-input'
          />
        </Flex>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              variant="outline"
              borderColor="gray.300"
            >
              Group By
              <MdExpandMore />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="status">Group by Status</Menu.Item>
              <Menu.Item value="group">Group by Group</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
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
