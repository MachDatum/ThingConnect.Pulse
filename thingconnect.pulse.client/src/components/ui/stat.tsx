import { Badge, type BadgeProps, Stat as ChakraStat, FormatNumber } from '@chakra-ui/react';
import { InfoTip } from './toggle-tip';
import * as React from 'react';

interface StatLabelProps extends ChakraStat.LabelProps {
  info?: React.ReactNode;
}

export const StatLabel = function StatLabel({
  ref,
  ...props
}: StatLabelProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { info, children, ...rest } = props;
  return (
    <ChakraStat.Label {...rest} ref={ref}>
      {children}
      {info && <InfoTip>{info}</InfoTip>}
    </ChakraStat.Label>
  );
};

interface StatValueTextProps extends ChakraStat.ValueTextProps {
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

export const StatValueText = function StatValueText({
  ref,
  ...props
}: StatValueTextProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { value, formatOptions, children, ...rest } = props;
  return (
    <ChakraStat.ValueText {...rest} ref={ref}>
      {children || (value != null && <FormatNumber value={value} {...formatOptions} />)}
    </ChakraStat.ValueText>
  );
};

export const StatUpTrend = function StatUpTrend({
  ref,
  ...props
}: BadgeProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Badge colorPalette='green' gap='0' {...props} ref={ref}>
      <ChakraStat.UpIndicator />
      {props.children}
    </Badge>
  );
};

export const StatDownTrend = function StatDownTrend({
  ref,
  ...props
}: BadgeProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Badge colorPalette='red' gap='0' {...props} ref={ref}>
      <ChakraStat.DownIndicator />
      {props.children}
    </Badge>
  );
};

export const StatRoot = ChakraStat.Root;
export const StatHelpText = ChakraStat.HelpText;
export const StatValueUnit = ChakraStat.ValueUnit;
