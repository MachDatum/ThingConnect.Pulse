import { Progress as ChakraProgress } from '@chakra-ui/react';
import { InfoTip } from './toggle-tip';
import * as React from 'react';

export const ProgressBar = function ProgressBar({
  ref,
  ...props
}: ChakraProgress.TrackProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <ChakraProgress.Track {...props} ref={ref}>
      <ChakraProgress.Range />
    </ChakraProgress.Track>
  );
};

export interface ProgressLabelProps extends ChakraProgress.LabelProps {
  info?: React.ReactNode;
}

export const ProgressLabel = function ProgressLabel({
  ref,
  ...props
}: ProgressLabelProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { children, info, ...rest } = props;
  return (
    <ChakraProgress.Label {...rest} ref={ref}>
      {children}
      {info && <InfoTip>{info}</InfoTip>}
    </ChakraProgress.Label>
  );
};

export const ProgressRoot = ChakraProgress.Root;
export const ProgressValueText = ChakraProgress.ValueText;
