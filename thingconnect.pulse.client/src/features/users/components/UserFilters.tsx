import {
  HStack,
  Input,
  Select,
  Button,
  Icon,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { Search, X, Filter } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { UsersListParams } from '@/api/types';

interface UserFiltersProps {
  onFilterChange: (filters: UsersListParams) => void;
  loading?: boolean;
}

export function UserFilters({ onFilterChange, loading = false }: UserFiltersProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');

  const handleFilterChange = useCallback(() => {
    const filters: UsersListParams = {
      page: 1, // Reset to first page when filtering
    };

    if (search.trim()) {
      filters.search = search.trim();
    }

    if (role) {
      filters.role = role;
    }

    if (isActive !== '') {
      filters.isActive = isActive === 'true';
    }

    onFilterChange(filters);
  }, [search, role, isActive, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRole('');
    setIsActive('');
    onFilterChange({ page: 1 });
  }, [onFilterChange]);

  const hasFilters = search.trim() || role || isActive !== '';

  return (
    <Box p={4} bg="white" _dark={{ bg: "gray.800" }} borderRadius="lg" border="1px solid" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
      <HStack gap={4} wrap="wrap">
        {/* Search Input */}
        <HStack flex="1" minW="200px">
          <Box pos="relative" flex="1">
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
              pl={10}
              disabled={loading}
            />
            <Icon
              as={Search}
              pos="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              boxSize={4}
            />
          </Box>
        </HStack>

        {/* Role Filter */}
        <Select.Root
          value={role}
          onValueChange={(details) => setRole(details.value[0] || '')}
          disabled={loading}
          width="150px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="All Roles" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Roles</Select.Item>
            <Select.Item value="Administrator">Administrator</Select.Item>
            <Select.Item value="User">User</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* Status Filter */}
        <Select.Root
          value={isActive}
          onValueChange={(details) => setIsActive(details.value[0] || '')}
          disabled={loading}
          width="150px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="All Status" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Status</Select.Item>
            <Select.Item value="true">Active</Select.Item>
            <Select.Item value="false">Inactive</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* Filter Button */}
        <Button
          onClick={handleFilterChange}
          colorPalette="blue"
          variant="solid"
          size="md"
          disabled={loading}
          leftIcon={<Filter size={16} />}
        >
          Filter
        </Button>

        {/* Clear Filters Button */}
        {hasFilters && (
          <IconButton
            onClick={handleClearFilters}
            variant="outline"
            colorPalette="gray"
            size="md"
            disabled={loading}
            aria-label="Clear filters"
          >
            <X size={16} />
          </IconButton>
        )}
      </HStack>
    </Box>
  );
}