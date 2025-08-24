import type { ButtonProps } from '@chakra-ui/react';
import { IconButton as ChakraIconButton } from '@chakra-ui/react';
import * as React from 'react';
import { LuX } from 'react-icons/lu';

export type CloseButtonProps = ButtonProps;

export const CloseButton = function CloseButton({ ref, ...props }: CloseButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    return (
      <ChakraIconButton variant='ghost' aria-label='Close' ref={ref} {...props}>
        {props.children ?? <LuX />}
      </ChakraIconButton>
    );
  };
