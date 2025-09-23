import {
  VStack,
  HStack,
  Heading,
  Button,
  Icon,
  Container,
  Box,
  Alert,
  useDisclosure,
} from '@chakra-ui/react';
import { UserPlus, Users } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Page } from '@/components/layout/Page';
import { PageContent } from '@/components/layout/PageContent';
import { UserFilters } from '@/features/users/components/UserFilters';
import { UserList } from '@/features/users/components/UserList';
import { CreateUserModal } from '@/features/users/components/CreateUserModal';
import { EditUserModal } from '@/features/users/components/EditUserModal';
import { useUserManagement } from '@/features/users/hooks/useUserManagement';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { UsersListParams, UserInfo } from '@/api/types';

export default function UserManagement() {
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    error,
    actionLoading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    resetUserPassword,
    toggleUserStatus,
    clearError,
  } = useUserManagement();

  const { open, onOpen, onClose } = useDisclosure();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [currentFilters, setCurrentFilters] = useState<UsersListParams>({ page: 1, pageSize: 20 });

  // Track page view
  useEffect(() => {
    analytics.trackPageView('User Management', {
      view_type: 'admin_panel',
      section: 'user_management',
    });
  }, [analytics]);

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers(currentFilters);
  }, [loadUsers, currentFilters]);

  const handleFilterChange = useCallback((filters: UsersListParams) => {
    setCurrentFilters({ ...filters, pageSize: 20 });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentFilters(prev => ({ ...prev, page }));
  }, []);

  const handleCreateUser = useCallback(
    async (request: any) => {
      await createUser(request);
      analytics.track('User Created', {
        user_role: request.role,
        created_by: currentUser?.id,
      });
    },
    [createUser, analytics, currentUser]
  );

  const handleUpdateUser = useCallback(
    async (id: string, request: any) => {
      await updateUser(id, request);
      analytics.track('User Updated', {
        user_id: id,
        updated_by: currentUser?.id,
      });
    },
    [updateUser, analytics, currentUser]
  );

  const handleDeleteUser = useCallback(
    async (id: string) => {
      await deleteUser(id);
      analytics.track('User Deleted', {
        user_id: id,
        deleted_by: currentUser?.id,
      });
    },
    [deleteUser, analytics, currentUser]
  );

  const handleChangeRole = useCallback(
    async (id: string, request: any) => {
      await changeUserRole(id, request);
      analytics.track('User Role Changed', {
        user_id: id,
        new_role: request.role,
        changed_by: currentUser?.id,
      });
    },
    [changeUserRole, analytics, currentUser]
  );

  const handleResetPassword = useCallback(
    async (id: string, request: any) => {
      await resetUserPassword(id, request);
      analytics.track('User Password Reset', {
        user_id: id,
        reset_by: currentUser?.id,
      });
    },
    [resetUserPassword, analytics, currentUser]
  );

  const handleToggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      await toggleUserStatus(id, isActive);
      analytics.track('User Status Changed', {
        user_id: id,
        new_status: isActive ? 'active' : 'inactive',
        changed_by: currentUser?.id,
      });
    },
    [toggleUserStatus, analytics, currentUser]
  );

  const handleEditUser = useCallback((user: UserInfo) => {
    setEditingUser(user);
    setEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setEditingUser(null);
  }, []);

  return (
    <Page
      title='User Management'
      testId='user-management-page'
      description='Manage users, roles, and permissions'
    >
      <PageContent>
        <Container maxW='6xl' h={'100%'} py={2} px={0}>
          <VStack gap={6} align='stretch'>
            {/* Header */}
            <HStack justify='space-between' wrap='wrap' gap={4}>
              <HStack gap={3}>
                <Box p={3} borderRadius='lg' bg='blue.50' _dark={{ bg: 'blue.900' }}>
                  <Icon as={Users} boxSize={6} color='blue.500' />
                </Box>
                <VStack align='start' gap={1}>
                  <Heading size='xl' color='gray.800' _dark={{ color: 'white' }}>
                    User Management
                  </Heading>
                  <HStack gap={2} color='gray.600' _dark={{ color: 'gray.400' }}>
                    <Icon as={Users} boxSize={4} />
                    {users && (
                      <span>
                        {users.totalCount} user{users.totalCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              <Button
                onClick={onOpen}
                colorPalette='blue'
                variant='solid'
                disabled={loading || actionLoading}
                size='md'
              >
                <UserPlus size={16} />
                Create User
              </Button>
            </HStack>

            {/* Global Error */}
            {error && (
              <Alert.Root status='error' variant='subtle' alignItems={'center'}>
                <Alert.Indicator />
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
                <Button variant='outline' size='sm' onClick={clearError}>
                  Dismiss
                </Button>
              </Alert.Root>
            )}

            {/* Filters */}
            <UserFilters onFilterChange={handleFilterChange} loading={loading} />

            {/* User List */}
            <UserList
              users={users}
              loading={loading}
              error={null} // We show global errors above
              currentUserId={currentUser?.id}
              onEdit={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onChangeRole={handleChangeRole}
              onResetPassword={handleResetPassword}
              onToggleStatus={handleToggleStatus}
              onPageChange={handlePageChange}
            />
          </VStack>
        </Container>

        {/* Modals */}
        {open && (
          <CreateUserModal
            isOpen={open}
            onClose={onClose}
            onCreateUser={handleCreateUser}
            loading={actionLoading}
          />
        )}

        <EditUserModal
          isOpen={editModalOpen}
          user={editingUser}
          onClose={handleCloseEditModal}
          onUpdateUser={handleUpdateUser}
          loading={actionLoading}
        />
      </PageContent>
    </Page>
  );
}
