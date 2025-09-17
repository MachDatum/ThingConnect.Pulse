import { useState, useCallback } from 'react';
import { UserManagementService } from '@/api/services/user-management.service';
import type {
  UserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  ResetPasswordRequest,
  UsersListParams,
  PagedResult,
} from '@/api/types';

export interface UseUserManagementReturn {
  // State
  users: PagedResult<UserInfo> | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;

  // Actions
  loadUsers: (params?: UsersListParams) => Promise<void>;
  createUser: (request: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, request: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, request: ChangeRoleRequest) => Promise<void>;
  resetUserPassword: (id: string, request: ResetPasswordRequest) => Promise<void>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<PagedResult<UserInfo> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    console.error('User management error:', err);
    if (err instanceof Error) {
      try {
        const apiError = JSON.parse(err.message);
        setError(apiError.message || 'An unexpected error occurred');
      } catch {
        setError(err.message || 'An unexpected error occurred');
      }
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const loadUsers = useCallback(async (params?: UsersListParams) => {
    try {
      setLoading(true);
      setError(null);
      const result = await UserManagementService.getUsers(params);
      setUsers(result);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createUser = useCallback(async (request: CreateUserRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.createUser(request);
      // Refresh the users list after creation
      await loadUsers();
    } catch (err) {
      handleError(err);
      throw err; // Re-throw to allow component to handle success/failure
    } finally {
      setActionLoading(false);
    }
  }, [handleError, loadUsers]);

  const updateUser = useCallback(async (id: string, request: UpdateUserRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.updateUser(id, request);
      // Refresh the users list after update
      await loadUsers();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [handleError, loadUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.deleteUser(id);
      // Refresh the users list after deletion
      await loadUsers();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [handleError, loadUsers]);

  const changeUserRole = useCallback(async (id: string, request: ChangeRoleRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.changeUserRole(id, request);
      // Refresh the users list after role change
      await loadUsers();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [handleError, loadUsers]);

  const resetUserPassword = useCallback(async (id: string, request: ResetPasswordRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.resetUserPassword(id, request);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [handleError]);

  const toggleUserStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      setError(null);
      await UserManagementService.toggleUserStatus(id, isActive);
      // Refresh the users list after status change
      await loadUsers();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [handleError, loadUsers]);

  return {
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
  };
}