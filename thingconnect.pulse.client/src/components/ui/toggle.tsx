'use client';

import type { ButtonProps } from '@chakra-ui/react';
import { Button, Toggle as ChakraToggle, useToggleContext } from '@chakra-ui/react';
import * as React from 'react';

interface ToggleProps extends ChakraToggle.RootProps {
  variant?: keyof typeof variantMap;
  size?: ButtonProps['size'];
}

const variantMap = {
  solid: { on: 'solid', off: 'outline' },
  surface: { on: 'surface', off: 'outline' },
  subtle: { on: 'subtle', off: 'ghost' },
  ghost: { on: 'subtle', off: 'ghost' },
} as const;

export const Toggle = function Toggle({ ref, ...props }: ToggleProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { variant = 'subtle', size, children, ...rest } = props;
  const variantConfig = variantMap[variant];

  return (
    <ChakraToggle.Root asChild {...rest}>
      <ToggleBaseButton size={size} variant={variantConfig} ref={ref}>
        {children}
      </ToggleBaseButton>
    </ChakraToggle.Root>
  );
};

interface ToggleBaseButtonProps extends Omit<ButtonProps, 'variant'> {
  variant: Record<'on' | 'off', ButtonProps['variant']>;
}

const ToggleBaseButton = function ToggleBaseButton({ ref, ...props }: ToggleBaseButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    const toggle = useToggleContext();
    const { variant, ...rest } = props;
    return <Button variant={toggle.pressed ? variant.on : variant.off} ref={ref} {...rest} />;
  };

export const ToggleIndicator = ChakraToggle.Indicator;
