import { PinInput as ChakraPinInput, Group } from '@chakra-ui/react';
import * as React from 'react';

export interface PinInputProps extends ChakraPinInput.RootProps {
  rootRef?: React.RefObject<HTMLDivElement | null>;
  count?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  attached?: boolean;
}

export const PinInput = function PinInput({
  ref,
  ...props
}: PinInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  const { count = 4, inputProps, rootRef, attached, ...rest } = props;
  return (
    <ChakraPinInput.Root ref={rootRef} {...rest}>
      <ChakraPinInput.HiddenInput ref={ref} {...inputProps} />
      <ChakraPinInput.Control>
        <Group attached={attached}>
          {Array.from({ length: count }).map((_, index) => (
            <ChakraPinInput.Input key={index} index={index} />
          ))}
        </Group>
      </ChakraPinInput.Control>
    </ChakraPinInput.Root>
  );
};
