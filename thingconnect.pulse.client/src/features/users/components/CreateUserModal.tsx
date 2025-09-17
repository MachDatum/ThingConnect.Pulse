import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Select,
  Alert,
  PasswordInput,
} from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { CreateUserRequest } from '@/api/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (request: CreateUserRequest) => Promise<void>;
  loading?: boolean;
}

interface FormData extends CreateUserRequest {
  confirmPassword: string;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
  loading = false,
}: CreateUserModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
    },
  });

  const password = watch('password');

  const handleClose = useCallback(() => {
    reset();
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setSubmitError(null);

        // Create user request without confirmPassword
        const { confirmPassword, ...request } = data;
        await onCreateUser(request);

        handleClose();
      } catch (err) {
        console.error('Create user error:', err);
        if (err instanceof Error) {
          try {
            const apiError = JSON.parse(err.message);
            setSubmitError(apiError.message || 'Failed to create user');
          } catch {
            setSubmitError(err.message || 'Failed to create user');
          }
        } else {
          setSubmitError('Failed to create user');
        }
      }
    },
    [onCreateUser, handleClose]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <DialogContent maxW="md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
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
              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  {...register('username', {
                    required: 'Username is required',
                    maxLength: {
                      value: 256,
                      message: 'Username must be 256 characters or less',
                    },
                  })}
                  placeholder="Enter username"
                  disabled={isSubmitting || loading}
                />
                {errors.username && (
                  <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Email */}
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
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
                {errors.email && (
                  <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Password */}
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <PasswordInput
                  {...register('password', {
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
                  placeholder="Enter password"
                  disabled={isSubmitting || loading}
                />
                {errors.password && (
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Confirm Password */}
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <PasswordInput
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  placeholder="Confirm password"
                  disabled={isSubmitting || loading}
                />
                {errors.confirmPassword && (
                  <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Role */}
              <FormControl isInvalid={!!errors.role}>
                <FormLabel>Role</FormLabel>
                <Select.Root
                  {...register('role', { required: 'Role is required' })}
                  disabled={isSubmitting || loading}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select role" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="User">User</Select.Item>
                    <Select.Item value="Administrator">Administrator</Select.Item>
                  </Select.Content>
                </Select.Root>
                {errors.role && (
                  <FormErrorMessage>{errors.role.message}</FormErrorMessage>
                )}
              </FormControl>
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
                loadingText="Creating..."
              >
                Create User
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}