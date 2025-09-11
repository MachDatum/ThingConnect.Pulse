import { useState, forwardRef } from 'react';
import { Box, Input, Button } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<InputProps, 'type'> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Box position='relative' w='full'>
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          pr='3rem'
          size='md'
          borderColor='gray.400'
          color='gray.800'
          _placeholder={{ color: 'gray.500', fontWeight: 'medium' }}
          _focus={{ borderColor: '#076bb3', boxShadow: '0 0 0 1px #076bb3' }}
          {...props}
        />
        <Button
          variant='ghost'
          size='sm'
          position='absolute'
          right='0.5rem'
          top='50%'
          transform='translateY(-50%)'
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          color='gray.600'
          _hover={{ color: 'gray.800' }}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </Box>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
