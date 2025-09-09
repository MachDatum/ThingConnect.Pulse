import { HStack, Input, Button, Box, Icon, Menu, Text, Flex } from '@chakra-ui/react';
import { X, CheckCircle } from 'lucide-react';
import type { LiveStatusParams } from '@/api/types';
import { MdSearch, MdExpandMore } from 'react-icons/md';

const DEFAULT_GROUPS: string[] = [];

interface StatusFiltersProps {
  filters: LiveStatusParams;
  onFiltersChange: (filters: LiveStatusParams) => void;
  groups?: string[];
  onGroupByChange?: (groupBy: string) => void;
  groupByOptions?: string[];
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
}

export function StatusFilters({
  filters,
  onFiltersChange,
  onGroupByChange,
  groups = DEFAULT_GROUPS,
  groupByOptions = [],
  searchTerm = '',
  onSearchChange,
}: StatusFiltersProps) {
  const handleGroupChange = (value: string) => {
    onFiltersChange({
      ...filters,
      group: value || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const handleSearchChange = (value: string) => {
    // Update search term in parent component
    onSearchChange && onSearchChange(value);
    
    // Optionally reset page when searching
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1,
    });
  };

  const clearSearch = () => {
    onSearchChange && onSearchChange('');
    onFiltersChange({
      ...filters,
      search: undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    onSearchChange && onSearchChange('');
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
        <Flex w='80' position='relative' align='center'>
          <Icon 
            as={MdSearch}
            color='gray.400' 
            position='absolute' 
            left='3' 
            top='50%' 
            transform='translateY(-50%)' 
            zIndex={2} 
            fontSize={'18px'}
          />
          <Input
            placeholder='Search endpoints by name or host...'
            pl='10'
            pr={searchTerm ? '10' : '4'}
            borderColor='gray.300'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            data-testid='search-input'
          />
          {searchTerm && (
            <Box
              px={3}
              onClick={clearSearch}
              data-testid='clear-search'
              position='absolute'
              right='0'
              top='50%'
              transform='translateY(-50%)'
              zIndex={10}
              cursor={'pointer'}
            >
              <X size={16} />
            </Box>
          )}
        </Flex>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              variant="outline"
              borderColor="gray.300"
            >
              {groupByOptions.length > 0 
                ? groupByOptions.map(opt => 
                    opt === 'status' ? 'Status' : 
                    opt === 'group' ? 'Group' : opt
                  ).join(' + ')
                : 'Group By'}
              <MdExpandMore />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item 
                value="status" 
                onSelect={() => {
                  onGroupByChange && onGroupByChange('status');
                }}
              >
                <HStack w="full" justify="space-between" align="center">
                  <Text as="span">Group by Status</Text>
                  {groupByOptions.includes('status') && <CheckCircle size={16} color="green" />}
                </HStack>
              </Menu.Item>
              <Menu.Item 
                value="group" 
                onSelect={() => {
                  onGroupByChange && onGroupByChange('group');
                }}
              >
                <HStack w="full" justify="space-between" align="center">
                  <Text as="span">Group by Group</Text>
                  {groupByOptions.includes('group') && <CheckCircle size={16} color="green" />}
                </HStack>
              </Menu.Item>
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