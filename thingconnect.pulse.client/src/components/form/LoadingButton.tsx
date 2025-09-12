import { Button, Spinner } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        bg='#076bb3'
        color='white'
        _hover={{ bg: '#065a96' }}
        _active={{ bg: '#054d82' }}
        _disabled={{
          bg: 'gray.400',
          color: 'white',
          cursor: 'not-allowed',
          _hover: { bg: 'gray.400' },
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size='sm' mr={2} />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
