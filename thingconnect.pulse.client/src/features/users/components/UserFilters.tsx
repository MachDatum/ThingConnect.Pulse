import {
  HStack,
  Input,
  Button,
  Icon,
  IconButton,
  Box,
  NativeSelect,
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
    <Box p={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} borderRadius="lg" border="1px solid" borderColor="gray.200">
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
              _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
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
        <NativeSelect.Root width="150px">
          <NativeSelect.Field
            placeholder="All Roles"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <option value="">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="User">User</option>
          </NativeSelect.Field>
        </NativeSelect.Root>

        {/* Status Filter */}
        <NativeSelect.Root width="150px">
          <NativeSelect.Field
            placeholder="All Status"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </NativeSelect.Field>
        </NativeSelect.Root>

        {/* Filter Button */}
        <Button
          onClick={handleFilterChange}
          colorPalette="blue"
          variant="solid"
          size="md"
          _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          <Filter size={16} />
          Filter
        </Button>

        {/* Clear Filters Button */}
        {hasFilters && (
          <IconButton
            onClick={handleClearFilters}
            variant="outline"
            colorPalette="gray"
            size="md"
            _disabled={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            aria-label="Clear filters"
          >
            <X size={16} />
          </IconButton>
        )}
      </HStack>
    </Box>
  );
}