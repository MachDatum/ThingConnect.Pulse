import { Box, Flex, HStack, Icon, Input } from '@chakra-ui/react';
import { X } from 'lucide-react';
import type { LiveStatusParams } from '@/api/types';
import { MdSearch } from 'react-icons/md';
import { ComboboxSelect } from '../common/ComboboxSelect';

interface EndpointFiltersProps {
  filters: LiveStatusParams;
  onFiltersChange: (filters: LiveStatusParams & { group?: string }) => void; // single group
  groups?: {
    id: string;
    name: string;
  }[];
  selectedGroup?: string; // single
  onSelectedGroupChange?: (group: string | undefined) => void; // single
  onGroupByChange?: (groupBy: string) => void;
  groupByOptions?: string[];
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  onToggleGroupBy?: (groupBy: string, isSelected: boolean) => void;
}

export function EndpointFilters({
  filters,
  onFiltersChange,
  groups = [],
  groupByOptions = [],
  searchTerm = '',
  onSearchChange,
  onToggleGroupBy,
  selectedGroup,
  onSelectedGroupChange,
}: EndpointFiltersProps) {
  const handleGroupChange = (value: string | string[]) => {
    const newGroup = Array.isArray(value) ? value[0] : value;
    const finalGroup = newGroup || undefined;
    onSelectedGroupChange?.(finalGroup);
    onFiltersChange({
      ...filters,
      group: finalGroup,
    });
  };

  const handleSearchChange = (value: string) => {
    onSearchChange && onSearchChange(value);

    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const clearSearch = () => {
    onSearchChange?.('');
  };

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
      <HStack
        gap={{ base: 2, md: 4 }}
        align='center'
        justifyContent={'flex-start'}
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
      >
        {/* Group Filter */}
        <Box>
          <ComboboxSelect
            items={groups.map(g => ({ label: g.name, value: g.id }))}
            selectedValue={selectedGroup ? selectedGroup : ''}
            onChange={handleGroupChange}
            isLoading={false}
          />
        </Box>
        {/* Search Input */}
        <Box>
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
        </Box>
        {/* Group By Dropdown */}
        <Box w='xs'>
          <ComboboxSelect
            items={[
              { label: 'Status', value: 'status' },
              { label: 'Group', value: 'group' },
            ]}
            selectedValue={groupByOptions}
            onChange={(values: string | string[]) => {
              const selected = Array.isArray(values) ? values : values ? [values] : [];

              ['status', 'group'].forEach(opt => {
                const isSelected = selected.includes(opt);
                onToggleGroupBy?.(opt, isSelected);
              });
            }}
            placeholder='Group By'
            defaultToFirst={false}
            isMulti={true}
          />
        </Box>
      </HStack>
    </Box>
  );
}
