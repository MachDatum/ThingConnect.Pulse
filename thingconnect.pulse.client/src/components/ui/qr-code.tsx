import { QrCode as ChakraQrCode } from '@chakra-ui/react';
import * as React from 'react';

export interface QrCodeProps extends Omit<ChakraQrCode.RootProps, 'fill' | 'overlay'> {
  fill?: string;
  overlay?: React.ReactNode;
}

export const QrCode = function QrCode({ ref, ...props }: QrCodeProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { children, fill, overlay, ...rest } = props;
  return (
    <ChakraQrCode.Root ref={ref} {...rest}>
      <ChakraQrCode.Frame style={{ fill }}>
        <ChakraQrCode.Pattern />
      </ChakraQrCode.Frame>
      {overlay}
      {children && <ChakraQrCode.Overlay>{children}</ChakraQrCode.Overlay>}
    </ChakraQrCode.Root>
  );
};
