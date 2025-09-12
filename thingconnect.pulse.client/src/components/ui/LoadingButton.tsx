import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      size='lg'
      bg='#076bb3'
      _hover={{ bg: '#065a96' }}
      _active={{ bg: '#054a7a' }}
      fontWeight='semibold'
      color='white'
      loading={loading}
      loadingText={loadingText}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </Button>
  );
}
