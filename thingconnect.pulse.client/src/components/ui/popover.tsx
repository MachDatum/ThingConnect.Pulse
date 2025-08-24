import { Popover as ChakraPopover, Portal } from '@chakra-ui/react';
import { CloseButton } from './close-button';
import * as React from 'react';

interface PopoverContentProps extends ChakraPopover.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const PopoverContent = function PopoverContent({ ref, ...props }: PopoverContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    const { portalled = true, portalRef, ...rest } = props;
    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraPopover.Positioner>
          <ChakraPopover.Content ref={ref} {...rest} />
        </ChakraPopover.Positioner>
      </Portal>
    );
  };

export const PopoverArrow = function PopoverArrow({ ref, ...props }: ChakraPopover.ArrowProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <ChakraPopover.Arrow {...props} ref={ref}>
        <ChakraPopover.ArrowTip />
      </ChakraPopover.Arrow>
    );
  };

export const PopoverCloseTrigger = function PopoverCloseTrigger({ ref, ...props }: ChakraPopover.CloseTriggerProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <ChakraPopover.CloseTrigger
      position='absolute'
      top='1'
      insetEnd='1'
      {...props}
      asChild
      ref={ref}
    >
      <CloseButton size='sm' />
    </ChakraPopover.CloseTrigger>
  );
};

export const PopoverTitle = ChakraPopover.Title;
export const PopoverDescription = ChakraPopover.Description;
export const PopoverFooter = ChakraPopover.Footer;
export const PopoverHeader = ChakraPopover.Header;
export const PopoverRoot = ChakraPopover.Root;
export const PopoverBody = ChakraPopover.Body;
export const PopoverTrigger = ChakraPopover.Trigger;
