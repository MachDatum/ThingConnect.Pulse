import type { ReactNode } from 'react';
import { Box, Input, Text } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';
import { testId } from '@/utils/testUtils';

interface FormFieldProps extends Omit<InputProps, 'type'> {
  label?: string;
  error?: string;
  children?: ReactNode;
  type?: string;
  fieldName?: string;
}

export function FormField({
  label,
  error,
  children,
  type = 'text',
  fieldName,
  required,
  ...props
}: FormFieldProps) {
  const fieldId = fieldName || props.id || `field-${Date.now()}`;
  const errorId = `${fieldId}-error`;
  const labelId = `${fieldId}-label`;

  if (children) {
    return (
      <Box w='full'>
        {label && (
          <label
            id={labelId}
            htmlFor={fieldId}
            style={{
              marginBottom: '8px',
              color: 'var(--chakra-colors-gray-700)',
              fontWeight: 'medium',
              fontSize: '14px',
              display: 'block'
            }}
            data-testid={testId.custom(['label', fieldName || 'field'])}
          >
            {label}
            {required && (
              <span style={{ color: 'var(--chakra-colors-red-500)', marginLeft: '4px' }} aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <Box data-testid={testId.input(fieldName || 'field')}>
          {children}
        </Box>
        {error && (
          <Text
            id={errorId}
            mt={1}
            color='red.500'
            fontSize='xs'
            fontWeight='medium'
            role="alert"
            aria-live="polite"
            data-testid={testId.error(fieldName || 'field')}
          >
            {error}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box w='full'>
      {label && (
        <label
          id={labelId}
          htmlFor={fieldId}
          style={{
            marginBottom: '8px',
            color: 'var(--chakra-colors-gray-700)',
            fontWeight: 'medium',
            fontSize: '14px',
            display: 'block'
          }}
          data-testid={testId.custom(['label', fieldName || 'field'])}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--chakra-colors-red-500)', marginLeft: '4px' }} aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <Input
        id={fieldId}
        type={type}
        size='md'
        borderColor='gray.400'
        color='gray.800'
        _placeholder={{ color: 'gray.500', fontWeight: 'medium' }}
        _focus={{ borderColor: '#076bb3', boxShadow: '0 0 0 1px #076bb3' }}
        data-testid={testId.input(fieldName || 'field')}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      />
      {error && (
        <Text
          id={errorId}
          mt={1}
          color='red.500'
          fontSize='xs'
          fontWeight='medium'
          role="alert"
          aria-live="polite"
          data-testid={testId.error(fieldName || 'field')}
        >
          {error}
        </Text>
      )}
    </Box>
  );
}
