import type { SkeletonProps as ChakraSkeletonProps, CircleProps } from '@chakra-ui/react';
import { Skeleton as ChakraSkeleton, Circle, Stack } from '@chakra-ui/react';
import * as React from 'react';

export interface SkeletonCircleProps extends ChakraSkeletonProps {
  size?: CircleProps['size'];
}

export const SkeletonCircle = function SkeletonCircle({
  ref,
  ...props
}: SkeletonCircleProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { size, ...rest } = props;
  return (
    <Circle size={size} asChild ref={ref}>
      <ChakraSkeleton {...rest} />
    </Circle>
  );
};

export interface SkeletonTextProps extends ChakraSkeletonProps {
  noOfLines?: number;
}

export const SkeletonText = function SkeletonText({
  ref,
  ...props
}: SkeletonTextProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { noOfLines = 3, gap, ...rest } = props;
  return (
    <Stack gap={gap} width='full' ref={ref}>
      {Array.from({ length: noOfLines }).map((_, index) => (
        <ChakraSkeleton height='4' key={index} {...props} _last={{ maxW: '80%' }} {...rest} />
      ))}
    </Stack>
  );
};

export const Skeleton = ChakraSkeleton;
