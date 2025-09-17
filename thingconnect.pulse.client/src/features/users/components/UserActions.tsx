import {
  Menu,
  IconButton,
  Icon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Text,
  VStack,
  Alert,
  NativeSelect,
} from '@chakra-ui/react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/form/PasswordInput';
import type { UserInfo, ChangeRoleRequest, ResetPasswordRequest } from '@/api/types';

interface UserActionsProps {
  user: UserInfo;
  currentUserId?: string;
  onEdit: (user: UserInfo) => void;
  onDelete: (id: string) => Promise<void>;
  onChangeRole: (id: string, request: ChangeRoleRequest) => Promise<void>;
  onResetPassword: (id: string, request: ResetPasswordRequest) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  loading?: boolean;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ChangeRoleFormData {
  role: 'User' | 'Administrator';
}

export function UserActions({
  user,
  currentUserId,
  onEdit,
  onDelete,
  onChangeRole,
  onResetPassword,
  onToggleStatus,
  loading = false,
}: UserActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = user.id === currentUserId;

  // Reset Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch: watchPassword,
  } = useForm<ResetPasswordFormData>();

  // Change Role Form
  const {
    handleSubmit: handleSubmitRole,
    formState: { errors: roleErrors },
    reset: resetRoleForm,
    setValue: setRoleValue,
  } = useForm<ChangeRoleFormData>({
    defaultValues: { role: user.role },
  });

  const newPassword = watchPassword('newPassword');

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      try {
        const apiError = JSON.parse(err.message);
        setError(apiError.message || 'An error occurred');
      } catch {
        setError(err.message || 'An error occurred');
      }
    } else {
      setError('An error occurred');
    }
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);
      await onDelete(user.id);
      setDeleteDialogOpen(false);
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  }, [user.id, onDelete, handleError]);

  const handleResetPassword = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        setActionLoading(true);
        setError(null);
        await onResetPassword(user.id, { newPassword: data.newPassword });
        setResetPasswordDialogOpen(false);
        resetPasswordForm();
      } catch (err) {
        handleError(err);
      } finally {
        setActionLoading(false);
      }
    },
    [user.id, onResetPassword, handleError, resetPasswordForm]
  );

  const handleChangeRole = useCallback(
    async (data: ChangeRoleFormData) => {
      try {
        setActionLoading(true);
        setError(null);
        await onChangeRole(user.id, { role: data.role });
        setChangeRoleDialogOpen(false);
        resetRoleForm();
      } catch (err) {
        handleError(err);
      } finally {
        setActionLoading(false);
      }
    },
    [user.id, onChangeRole, handleError, resetRoleForm]
  );

  const handleToggleStatus = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);
      await onToggleStatus(user.id, !user.isActive);
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  }, [user.id, user.isActive, onToggleStatus, handleError]);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            disabled={loading || actionLoading}
            aria-label="User actions"
          >
            <MoreVertical size={16} />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit" onSelect={() => onEdit(user)}>
              <Icon as={Edit} boxSize={4} />
              Edit User
            </Menu.Item>

            <Menu.Item value="change-role" onSelect={() => setChangeRoleDialogOpen(true)}>
              <Icon as={Shield} boxSize={4} />
              Change Role
            </Menu.Item>

            <Menu.Item value="reset-password" onSelect={() => setResetPasswordDialogOpen(true)}>
              <Icon as={Key} boxSize={4} />
              Reset Password
            </Menu.Item>

            <Menu.Item value="toggle-status" onSelect={handleToggleStatus}>
              <Icon as={user.isActive ? UserX : UserCheck} boxSize={4} />
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Menu.Item>

            <Menu.Item
              value="delete"
              onSelect={() => setDeleteDialogOpen(true)}
              disabled={isCurrentUser}
              color="red.500"
              _hover={{ bg: 'red.50', color: 'red.600' }}
              _dark={{ _hover: { bg: 'red.900', color: 'red.300' } }}
            >
              <Icon as={Trash2} boxSize={4} />
              Remove User
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(e) => !e.open && setDeleteDialogOpen(false)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove User</DialogTitle>
            </DialogHeader>

            <VStack gap={4} py={4}>
              {error && (
                <Alert.Root status="error" variant="subtle">
                  <Alert.Indicator />
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
              )}

              <Text>
                Are you sure you want to remove the user <strong>{user.username}</strong>?
                This will deactivate their account and prevent login, but preserves all data for audit purposes.
              </Text>
            </VStack>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <LoadingButton
                colorPalette="red"
                onClick={handleDelete}
                loading={actionLoading}
                loadingText="Removing..."
              >
                Remove User
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Reset Password Dialog */}
      <Dialog.Root
        open={resetPasswordDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) {
            setResetPasswordDialogOpen(false);
            resetPasswordForm();
            setError(null);
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password for {user.username}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitPassword(handleResetPassword)}>
              <VStack gap={4} py={4}>
                {error && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                <Field
                  label="New Password"
                  errorText={passwordErrors.newPassword?.message}
                  invalid={!!passwordErrors.newPassword}
                >
                  <PasswordInput
                    {...registerPassword('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Password must be 100 characters or less',
                      },
                    })}
                    placeholder="Enter new password"
                    disabled={actionLoading}
                  />
                </Field>

                <Field
                  label="Confirm New Password"
                  errorText={passwordErrors.confirmPassword?.message}
                  invalid={!!passwordErrors.confirmPassword}
                >
                  <PasswordInput
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm the password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    placeholder="Confirm new password"
                    disabled={actionLoading}
                  />
                </Field>
              </VStack>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordDialogOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  colorPalette="blue"
                  loading={actionLoading}
                  loadingText="Resetting..."
                >
                  Reset Password
                </LoadingButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Change Role Dialog */}
      <Dialog.Root
        open={changeRoleDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) {
            setChangeRoleDialogOpen(false);
            resetRoleForm({ role: user.role });
            setError(null);
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role for {user.username}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitRole(handleChangeRole)}>
              <VStack gap={4} py={4}>
                {error && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                <Text color="gray.600" _dark={{ color: "gray.400" }}>
                  Current role: <strong>{user.role}</strong>
                </Text>

                <Field
                  label="New Role"
                  errorText={roleErrors.role?.message}
                  invalid={!!roleErrors.role}
                >
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder="Select role"
                      defaultValue={user.role}
                      onChange={(e) => setRoleValue('role', e.target.value as 'User' | 'Administrator')}
                      _disabled={actionLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      <option value="User">User</option>
                      <option value="Administrator">Administrator</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field>
              </VStack>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setChangeRoleDialogOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  colorPalette="blue"
                  loading={actionLoading}
                  loadingText="Changing..."
                >
                  Change Role
                </LoadingButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}