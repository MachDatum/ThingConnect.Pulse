import type { SystemStyleObject } from '@chakra-ui/react';
import { AbsoluteCenter, ProgressCircle as ChakraProgressCircle } from '@chakra-ui/react';
import * as React from 'react';

interface ProgressCircleRingProps extends ChakraProgressCircle.CircleProps {
  trackColor?: SystemStyleObject['stroke'];
  cap?: SystemStyleObject['strokeLinecap'];
}

export const ProgressCircleRing = function ProgressCircleRing({ ref, ...props }: ProgressCircleRingProps & { ref?: React.RefObject<SVGSVGElement | null> }) {
    const { trackColor, cap, color, ...rest } = props;
    return (
      <ChakraProgressCircle.Circle {...rest} ref={ref}>
        <ChakraProgressCircle.Track stroke={trackColor} />
        <ChakraProgressCircle.Range stroke={color} strokeLinecap={cap} />
      </ChakraProgressCircle.Circle>
    );
  };

export const ProgressCircleValueText = function ProgressCircleValueText({ ref, ...props }: ChakraProgressCircle.ValueTextProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <AbsoluteCenter>
      <ChakraProgressCircle.ValueText {...props} ref={ref} />
    </AbsoluteCenter>
  );
};

export const ProgressCircleRoot = ChakraProgressCircle.Root;
