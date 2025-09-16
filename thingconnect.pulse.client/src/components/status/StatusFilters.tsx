import { Box, Button, Flex, HStack, Icon, Input, Text, Menu } from '@chakra-ui/react';
import { X } from 'lucide-react';
import type { LiveStatusParams } from '@/api/types';
import { MdSearch, MdExpandMore } from 'react-icons/md';
import { ComboboxSelect } from '../common/ComboboxSelect';

interface StatusFiltersProps {
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

export function StatusFilters({
  filters,
  onFiltersChange,
  groups = [],
  groupByOptions = [],
  searchTerm = '',
  onSearchChange,
  onToggleGroupBy,
  selectedGroup,
  onSelectedGroupChange,
}: StatusFiltersProps) {
  const handleGroupChange = (value: string) => {
    const newGroup = value || undefined;
    onSelectedGroupChange?.(newGroup);
    onFiltersChange({
      ...filters,
      group: newGroup,
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
        <Box>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant='outline'>
                <Text fontSize='sm'>
                  {groupByOptions.length > 0
                    ? groupByOptions
                        .map(opt => (opt === 'status' ? 'Status' : opt === 'group' ? 'Group' : opt))
                        .join(' + ')
                    : 'Group By'}
                </Text>
                <MdExpandMore />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner px={4}>
              <Menu.Content minWidth='200px'>
                <Flex
                  justify='flex-end'
                  px={2}
                  py={1}
                  borderBottom='1px solid'
                  borderColor='gray.200'
                  _dark={{ borderColor: 'gray.600' }}
                >
                  <HStack gap={2}>
                    <Button
                      size='xs'
                      variant='ghost'
                      onClick={() => {
                        ['status', 'group'].forEach(
                          opt => onToggleGroupBy && onToggleGroupBy(opt, true)
                        );
                      }}
                      textDecoration={'underline'}
                    >
                      Select All
                    </Button>
                    <Button
                      size='xs'
                      variant='ghost'
                      onClick={() => {
                        ['status', 'group'].forEach(
                          opt => onToggleGroupBy && onToggleGroupBy(opt, false)
                        );
                      }}
                      textDecoration={'underline'}
                    >
                      Clear
                    </Button>
                  </HStack>
                </Flex>
                <Menu.ItemGroup>
                  <Menu.CheckboxItem
                    cursor={'pointer'}
                    value='status'
                    checked={groupByOptions.includes('status')}
                    onCheckedChange={() => {
                      onToggleGroupBy &&
                        onToggleGroupBy('status', !groupByOptions.includes('status'));
                    }}
                  >
                    <Flex w='full' justify='flex-start' align='center' gap={3}>
                      <Text as='span'>Group by Status</Text>
                      <Menu.ItemIndicator />
                    </Flex>
                  </Menu.CheckboxItem>
                  <Menu.CheckboxItem
                    cursor={'pointer'}
                    value='group'
                    checked={groupByOptions.includes('group')}
                    onCheckedChange={() => {
                      onToggleGroupBy &&
                        onToggleGroupBy('group', !groupByOptions.includes('group'));
                    }}
                  >
                    <Flex w='full' justify='flex-start' align='center' gap={3}>
                      <Text as='span'>Group by Group</Text>
                      <Menu.ItemIndicator />
                    </Flex>
                  </Menu.CheckboxItem>
                </Menu.ItemGroup>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      </HStack>
    </Box>
  );
}
