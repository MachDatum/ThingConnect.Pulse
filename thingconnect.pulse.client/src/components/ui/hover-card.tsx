import { HoverCard, Portal } from '@chakra-ui/react';
import * as React from 'react';

interface HoverCardContentProps extends HoverCard.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const HoverCardContent = function HoverCardContent({
  ref,
  ...props
}: HoverCardContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { portalled = true, portalRef, ...rest } = props;

  return (
    <Portal disabled={!portalled} container={portalRef}>
      <HoverCard.Positioner>
        <HoverCard.Content ref={ref} {...rest} />
      </HoverCard.Positioner>
    </Portal>
  );
};

export const HoverCardArrow = function HoverCardArrow({
  ref,
  ...props
}: HoverCard.ArrowProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <HoverCard.Arrow ref={ref} {...props}>
      <HoverCard.ArrowTip />
    </HoverCard.Arrow>
  );
};

export const HoverCardRoot = HoverCard.Root;
export const HoverCardTrigger = HoverCard.Trigger;
