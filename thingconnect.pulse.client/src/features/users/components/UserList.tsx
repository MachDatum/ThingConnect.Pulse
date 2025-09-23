import {
  Table,
  Badge,
  Text,
  VStack,
  HStack,
  Box,
  Button,
  Icon,
  Skeleton,
  Alert,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { UserActions } from './UserActions';
import type { UserInfo, PagedResult, ChangeRoleRequest, ResetPasswordRequest } from '@/api/types';
import { Status } from '@/components/ui/status';

interface UserListProps {
  users: PagedResult<UserInfo> | null;
  loading: boolean;
  error: string | null;
  currentUserId?: string;
  onEdit: (user: UserInfo) => void;
  onDeleteUser: (id: string) => Promise<void>;
  onChangeRole: (id: string, request: ChangeRoleRequest) => Promise<void>;
  onResetPassword: (id: string, request: ResetPasswordRequest) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function UserList({
  users,
  loading,
  error,
  currentUserId,
  onEdit,
  onDeleteUser,
  onChangeRole,
  onResetPassword,
  onToggleStatus,
  onPageChange,
}: UserListProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'purple';
      case 'User':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red';
  };

  if (error) {
    return (
      <Alert.Root status='error' variant='subtle'>
        <Alert.Indicator />
        <Alert.Title>Failed to load users</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  if (loading) {
    return (
      <VStack gap={4}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height='60px' w='full' />
        ))}
      </VStack>
    );
  }

  if (!users || users.items.length === 0) {
    return (
      <VStack gap={4} py={12} textAlign='center'>
        <Box p={4} borderRadius='full' bg='gray.50' _dark={{ bg: 'gray.700' }}>
          <Icon as={Users} boxSize={8} color='gray.400' />
        </Box>
        <VStack gap={2}>
          <Text fontSize='lg' fontWeight='medium' color='gray.700' _dark={{ color: 'gray.300' }}>
            No users found
          </Text>
          <Text color='gray.500' _dark={{ color: 'gray.400' }}>
            {users?.totalCount === 0
              ? 'There are no users in the system yet.'
              : 'Try adjusting your search filters.'}
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack gap={6}>
      {/* Table */}
      <Box w='full' overflowX='auto'>
        <Table.Root size='sm'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>User</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
              <Table.ColumnHeader>Last Login</Table.ColumnHeader>
              <Table.ColumnHeader width='50px'>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users!.items.map(user => (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <VStack align='start' gap={1}>
                    <HStack gap={2}>
                      <Text fontWeight='medium'>{user.username}</Text>
                      {user.id === currentUserId && (
                        <Badge colorPalette='blue' variant='subtle' size='sm'>
                          You
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                      {user.email}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getRoleBadgeColor(user.role)} variant='subtle' size='sm'>
                    {user.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Status value={user.isActive ? 'success' : 'error'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Status>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                    {formatDate(user.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
                    {formatDate(user.lastLoginAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <UserActions
                    user={user}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDeleteUser}
                    onChangeRole={onChangeRole}
                    onResetPassword={onResetPassword}
                    onToggleStatus={onToggleStatus}
                    loading={loading}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {users.totalPages > 1 && (
        <HStack justify='space-between' w='full'>
          <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
            Showing {(users.page - 1) * users.pageSize + 1} to{' '}
            {Math.min(users.page * users.pageSize, users.totalCount)} of {users.totalCount} users
          </Text>

          <HStack gap={2}>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(users.page - 1)}
              disabled={users.page <= 1 || loading}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <HStack gap={1}>
              {/* Show page numbers around current page */}
              {Array.from({ length: Math.min(5, users.totalPages) }, (_, i) => {
                const startPage = Math.max(1, users.page - 2);
                const pageNum = startPage + i;

                if (pageNum > users.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === users.page ? 'solid' : 'outline'}
                    colorPalette={pageNum === users.page ? 'blue' : 'gray'}
                    size='sm'
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    minW='40px'
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </HStack>

            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(users.page + 1)}
              disabled={users.page >= users.totalPages || loading}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </HStack>
        </HStack>
      )}
    </VStack>
  );
}
