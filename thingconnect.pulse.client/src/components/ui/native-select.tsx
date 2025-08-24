'use client';

import { NativeSelect as Select } from '@chakra-ui/react';
import * as React from 'react';

interface NativeSelectRootProps extends Select.RootProps {
  icon?: React.ReactNode;
}

export const NativeSelectRoot = function NativeSelect({ ref, ...props }: NativeSelectRootProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    const { icon, children, ...rest } = props;
    return (
      <Select.Root ref={ref} {...rest}>
        {children}
        <Select.Indicator>{icon}</Select.Indicator>
      </Select.Root>
    );
  };

interface NativeSelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface NativeSelectFieldProps extends Select.FieldProps {
  items?: Array<string | NativeSelectItem>;
}

export const NativeSelectField = function NativeSelectField({ ref, ...props }: NativeSelectFieldProps & { ref?: React.RefObject<HTMLSelectElement | null> }) {
    const { items: itemsProp, children, ...rest } = props;

    const items = React.useMemo(
      () =>
        itemsProp?.map(item => (typeof item === 'string' ? { label: item, value: item } : item)),
      [itemsProp]
    );

    return (
      <Select.Field ref={ref} {...rest}>
        {children}
        {items?.map(item => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </Select.Field>
    );
  };
