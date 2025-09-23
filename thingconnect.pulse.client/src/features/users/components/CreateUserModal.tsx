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
} from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/form/PasswordInput';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
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
    setValue,
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
    <Dialog.Root open={isOpen} onOpenChange={e => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <DialogContent maxW='md'>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4} pb={4} px={6} align='stretch'>
              {submitError && (
                <Alert.Root status='error' variant='subtle'>
                  <Alert.Indicator />
                  <Alert.Title>{submitError}</Alert.Title>
                </Alert.Root>
              )}

              {/* Username */}
              <Field
                label='Username'
                errorText={errors.username?.message}
                invalid={!!errors.username}
              >
                <Input
                  {...register('username', {
                    required: 'Username is required',
                    maxLength: {
                      value: 256,
                      message: 'Username must be 256 characters or less',
                    },
                  })}
                  placeholder='Enter username'
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Email */}
              <Field label='Email' errorText={errors.email?.message} invalid={!!errors.email}>
                <Input
                  type='email'
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
                  placeholder='Enter email address'
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Password */}
              <Field
                label='Password'
                errorText={errors.password?.message}
                invalid={!!errors.password}
              >
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
                  placeholder='Enter password'
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Confirm Password */}
              <Field
                label='Confirm Password'
                errorText={errors.confirmPassword?.message}
                invalid={!!errors.confirmPassword}
              >
                <PasswordInput
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match',
                  })}
                  placeholder='Confirm password'
                  disabled={isSubmitting || loading}
                />
              </Field>

              {/* Role */}
              <Field label='Role' errorText={errors.role?.message} invalid={!!errors.role}>
                <NativeSelectRoot>
                  <NativeSelectField
                    placeholder='Select role'
                    defaultValue='User'
                    onChange={e => setValue('role', e.target.value as 'User' | 'Administrator')}
                    _disabled={
                      isSubmitting || loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}
                    }
                  >
                    <option value='User'>User</option>
                    <option value='Administrator'>Administrator</option>
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
            </VStack>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting || loading}
                size={'md'}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                colorPalette='blue'
                loading={isSubmitting || loading}
                loadingText='Creating...'
                size={'md'}
              >
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
