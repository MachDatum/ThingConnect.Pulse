import type { ReactNode } from 'react';
import { Box, Input, Text } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';

interface FormFieldProps extends Omit<InputProps, 'type'> {
  label?: string;
  error?: string;
  children?: ReactNode;
  type?: string;
}

export function FormField({ label, error, children, type = 'text', ...props }: FormFieldProps) {
  if (children) {
    return (
      <Box w="full">
        {label && (
          <Text mb={2} color="gray.700" fontWeight="medium" fontSize="sm">
            {label}
          </Text>
        )}
        {children}
        {error && (
          <Text mt={1} color="red.500" fontSize="xs" fontWeight="medium">
            {error}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box w="full">
      {label && (
        <Text mb={2} color="gray.700" fontWeight="medium" fontSize="sm">
          {label}
        </Text>
      )}
      <Input
        type={type}
        size="md"
        borderColor="gray.400"
        color="gray.800"
        _placeholder={{ color: "gray.500", fontWeight: "medium" }}
        _focus={{ borderColor: "#076bb3", boxShadow: "0 0 0 1px #076bb3" }}
        {...props}
      />
      {error && (
        <Text mt={1} color="red.500" fontSize="xs" fontWeight="medium">
          {error}
        </Text>
      )}
    </Box>
  );
}