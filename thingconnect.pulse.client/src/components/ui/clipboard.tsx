import type { ButtonProps, InputProps } from '@chakra-ui/react';
import { Button, Clipboard as ChakraClipboard, IconButton, Input } from '@chakra-ui/react';
import * as React from 'react';
import { LuCheck, LuClipboard, LuLink } from 'react-icons/lu';

const ClipboardIcon = function ClipboardIcon({ ref, ...props }: ChakraClipboard.IndicatorProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <ChakraClipboard.Indicator copied={<LuCheck />} {...props} ref={ref}>
        <LuClipboard />
      </ChakraClipboard.Indicator>
    );
  };

const ClipboardCopyText = function ClipboardCopyText({ ref, ...props }: ChakraClipboard.IndicatorProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <ChakraClipboard.Indicator copied='Copied' {...props} ref={ref}>
        Copy
      </ChakraClipboard.Indicator>
    );
  };

export const ClipboardLabel = function ClipboardLabel({ ref, ...props }: ChakraClipboard.LabelProps & { ref?: React.RefObject<HTMLLabelElement | null> }) {
    return (
      <ChakraClipboard.Label
        textStyle='sm'
        fontWeight='medium'
        display='inline-block'
        mb='1'
        {...props}
        ref={ref}
      />
    );
  };

export const ClipboardButton = function ClipboardButton({ ref, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    return (
      <ChakraClipboard.Trigger asChild>
        <Button ref={ref} size='sm' variant='surface' {...props}>
          <ClipboardIcon />
          <ClipboardCopyText />
        </Button>
      </ChakraClipboard.Trigger>
    );
  };

export const ClipboardLink = function ClipboardLink({ ref, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    return (
      <ChakraClipboard.Trigger asChild>
        <Button
          unstyled
          variant='plain'
          size='xs'
          display='inline-flex'
          alignItems='center'
          gap='2'
          ref={ref}
          {...props}
        >
          <LuLink />
          <ClipboardCopyText />
        </Button>
      </ChakraClipboard.Trigger>
    );
  };

export const ClipboardIconButton = function ClipboardIconButton({ ref, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    return (
      <ChakraClipboard.Trigger asChild>
        <IconButton ref={ref} size='xs' variant='subtle' {...props}>
          <ClipboardIcon />
          <ClipboardCopyText srOnly />
        </IconButton>
      </ChakraClipboard.Trigger>
    );
  };

export const ClipboardInput = function ClipboardInputElement({ ref, ...props }: InputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
    return (
      <ChakraClipboard.Input asChild>
        <Input ref={ref} {...props} />
      </ChakraClipboard.Input>
    );
  };

export const ClipboardRoot = ChakraClipboard.Root;
