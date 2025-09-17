import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  VStack,
  Alert,
  HStack,
  Text,
  Switch,
} from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Field } from '@/components/ui/field';
import type { UserInfo, UpdateUserRequest } from '@/api/types';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserInfo | null;
  onClose: () => void;
  onUpdateUser: (id: string, request: UpdateUserRequest) => Promise<void>;
  loading?: boolean;
}

interface FormData extends UpdateUserRequest {
  id: string;
}

export function EditUserModal({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  loading = false,
}: EditUserModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>();

  const isActive = watch('isActive');

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const handleClose = useCallback(() => {
    reset();
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return;

      try {
        setSubmitError(null);

        // Create update request without id
        const { id, ...request } = data;

        // Only include changed fields
        const updateRequest: UpdateUserRequest = {};

        if (request.username !== user.username) {
          updateRequest.username = request.username;
        }

        if (request.email !== user.email) {
          updateRequest.email = request.email;
        }

        if (request.isActive !== user.isActive) {
          updateRequest.isActive = request.isActive;
        }

        // Only submit if there are changes
        if (Object.keys(updateRequest).length === 0) {
          handleClose();
          return;
        }

        await onUpdateUser(user.id, updateRequest);
        handleClose();
      } catch (err) {
        console.error('Update user error:', err);
        if (err instanceof Error) {
          try {
            const apiError = JSON.parse(err.message);
            setSubmitError(apiError.message || 'Failed to update user');
          } catch {
            setSubmitError(err.message || 'Failed to update user');
          }
        } else {
          setSubmitError('Failed to update user');
        }
      }
    },
    [user, onUpdateUser, handleClose]
  );

  if (!user) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <DialogContent maxW="md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4} py={4}>
              {submitError && (
                <Alert.Root status="error" variant="subtle">
                  <Alert.Indicator />
                  <Alert.Title>{submitError}</Alert.Title>
                </Alert.Root>
              )}

              {/* Username */}
              <Field
                label="Username"
                errorText={errors.username?.message}
                invalid={!!errors.username}
              >
                <Input
                  {...register('username', {
                    maxLength: {
                      value: 256,
                      message: 'Username must be 256 characters or less',
                    },
                  })}
                  placeholder="Enter username"
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Email */}
              <Field
                label="Email"
                errorText={errors.email?.message}
                invalid={!!errors.email}
              >
                <Input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                    maxLength: {
                      value: 256,
                      message: 'Email must be 256 characters or less',
                    },
                  })}
                  placeholder="Enter email address"
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Active Status */}
              <Field label="Account Status">
                <HStack justify="space-between" w="full">
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                      {isActive ? 'User can log in' : 'User cannot log in'}
                    </Text>
                  </VStack>
                  <Switch.Root
                    checked={isActive}
                    onCheckedChange={(details) => setValue('isActive', details.checked)}
                    colorPalette="green"
                    size="lg"
                    disabled={isSubmitting || loading}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              </Field>

              {/* Role Info (Read-only) */}
              <Field
                label="Role"
                helperText="Use the role change action in the user list to modify roles"
              >
                <Input
                  value={user.role}
                  disabled
                  bg="gray.50"
                  _dark={{ bg: "gray.700" }}
                />
              </Field>
            </VStack>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || loading}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                colorPalette="blue"
                loading={isSubmitting || loading}
                loadingText="Updating..."
              >
                Update User
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}