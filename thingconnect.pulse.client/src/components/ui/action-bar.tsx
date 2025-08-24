import { ActionBar, Portal } from '@chakra-ui/react';
import { CloseButton } from './close-button';
import * as React from 'react';

interface ActionBarContentProps extends ActionBar.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const ActionBarContent = function ActionBarContent({ ref, ...props }: ActionBarContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    const { children, portalled = true, portalRef, ...rest } = props;

    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ActionBar.Positioner>
          <ActionBar.Content ref={ref} {...rest} asChild={false}>
            {children}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    );
  };

export const ActionBarCloseTrigger = function ActionBarCloseTrigger({ ref, ...props }: ActionBar.CloseTriggerProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <ActionBar.CloseTrigger {...props} asChild ref={ref}>
      <CloseButton size='sm' />
    </ActionBar.CloseTrigger>
  );
};

export const ActionBarRoot = ActionBar.Root;
export const ActionBarSelectionTrigger = ActionBar.SelectionTrigger;
export const ActionBarSeparator = ActionBar.Separator;
