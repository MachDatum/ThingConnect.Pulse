import type { IconButtonProps, StackProps } from '@chakra-ui/react';
import {
  ColorPicker as ChakraColorPicker,
  For,
  IconButton,
  Portal,
  Span,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import * as React from 'react';
import { LuCheck, LuPipette } from 'react-icons/lu';

export const ColorPickerTrigger = function ColorPickerTrigger({ ref, ...props }: ChakraColorPicker.TriggerProps & { fitContent?: boolean } & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { fitContent, ...rest } = props;
  return (
    <ChakraColorPicker.Trigger data-fit-content={fitContent || undefined} ref={ref} {...rest}>
      {props.children || <ChakraColorPicker.ValueSwatch />}
    </ChakraColorPicker.Trigger>
  );
};

export const ColorPickerInput = function ColorHexInput({ ref, ...props }: Omit<ChakraColorPicker.ChannelInputProps, 'channel'> & { ref?: React.RefObject<HTMLInputElement | null> }) {
  return <ChakraColorPicker.ChannelInput channel='hex' ref={ref} {...props} />;
};

interface ColorPickerContentProps extends ChakraColorPicker.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const ColorPickerContent = function ColorPickerContent({ ref, ...props }: ColorPickerContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    const { portalled = true, portalRef, ...rest } = props;
    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraColorPicker.Positioner>
          <ChakraColorPicker.Content ref={ref} {...rest} />
        </ChakraColorPicker.Positioner>
      </Portal>
    );
  };

export const ColorPickerInlineContent = function ColorPickerInlineContent({ ref, ...props }: ChakraColorPicker.ContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <ChakraColorPicker.Content animation='none' shadow='none' padding='0' ref={ref} {...props} />
  );
};

export const ColorPickerSliders = function ColorPickerSliders({ ref, ...props }: StackProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <Stack gap='1' flex='1' px='1' ref={ref} {...props}>
        <ColorPickerChannelSlider channel='hue' />
        <ColorPickerChannelSlider channel='alpha' />
      </Stack>
    );
  };

export const ColorPickerArea = function ColorPickerArea({ ref, ...props }: ChakraColorPicker.AreaProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <ChakraColorPicker.Area ref={ref} {...props}>
        <ChakraColorPicker.AreaBackground />
        <ChakraColorPicker.AreaThumb />
      </ChakraColorPicker.Area>
    );
  };

export const ColorPickerEyeDropper = function ColorPickerEyeDropper({ ref, ...props }: IconButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
    return (
      <ChakraColorPicker.EyeDropperTrigger asChild>
        <IconButton size='xs' variant='outline' ref={ref} {...props}>
          <LuPipette />
        </IconButton>
      </ChakraColorPicker.EyeDropperTrigger>
    );
  };

export const ColorPickerChannelSlider = function ColorPickerSlider({ ref, ...props }: ChakraColorPicker.ChannelSliderProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <ChakraColorPicker.ChannelSlider ref={ref} {...props}>
      <ChakraColorPicker.TransparencyGrid size='0.6rem' />
      <ChakraColorPicker.ChannelSliderTrack />
      <ChakraColorPicker.ChannelSliderThumb />
    </ChakraColorPicker.ChannelSlider>
  );
};

export const ColorPickerSwatchTrigger = function ColorPickerSwatchTrigger({ ref, ...props }: ChakraColorPicker.SwatchTriggerProps & {
    swatchSize?: ChakraColorPicker.SwatchTriggerProps['boxSize'];
  } & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { swatchSize, children, ...rest } = props;
  return (
    <ChakraColorPicker.SwatchTrigger
      ref={ref}
      style={{ ['--color' as string]: props.value }}
      {...rest}
    >
      {children || (
        <ChakraColorPicker.Swatch boxSize={swatchSize} value={props.value}>
          <ChakraColorPicker.SwatchIndicator>
            <LuCheck />
          </ChakraColorPicker.SwatchIndicator>
        </ChakraColorPicker.Swatch>
      )}
    </ChakraColorPicker.SwatchTrigger>
  );
};

export const ColorPickerRoot = function ColorPickerRoot({ ref, ...props }: ChakraColorPicker.RootProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
    return (
      <ChakraColorPicker.Root ref={ref} {...props}>
        {props.children}
        <ChakraColorPicker.HiddenInput tabIndex={-1} />
      </ChakraColorPicker.Root>
    );
  };

const formatMap = {
  rgba: ['red', 'green', 'blue', 'alpha'],
  hsla: ['hue', 'saturation', 'lightness', 'alpha'],
  hsba: ['hue', 'saturation', 'brightness', 'alpha'],
  hexa: ['hex', 'alpha'],
} as const;

export const ColorPickerChannelInputs = function ColorPickerChannelInputs({ ref, ...props }: ChakraColorPicker.ViewProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const channels = formatMap[props.format];
  return (
    <ChakraColorPicker.View flexDirection='row' ref={ref} {...props}>
      {channels.map(channel => (
        <VStack gap='1' key={channel} flex='1'>
          <ColorPickerChannelInput
            channel={channel}
            px='0'
            height='7'
            textStyle='xs'
            textAlign='center'
          />
          <Text textStyle='xs' color='fg.muted' fontWeight='medium'>
            {channel.charAt(0).toUpperCase()}
          </Text>
        </VStack>
      ))}
    </ChakraColorPicker.View>
  );
};

export const ColorPickerChannelSliders = function ColorPickerChannelSliders({ ref, ...props }: ChakraColorPicker.ViewProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const channels = formatMap[props.format];
  return (
    <ChakraColorPicker.View {...props} ref={ref}>
      <For each={channels}>
        {channel => (
          <Stack gap='1' key={channel}>
            <Span textStyle='xs' minW='5ch' textTransform='capitalize' fontWeight='medium'>
              {channel}
            </Span>
            <ColorPickerChannelSlider channel={channel} />
          </Stack>
        )}
      </For>
    </ChakraColorPicker.View>
  );
};

export const ColorPickerLabel = ChakraColorPicker.Label;
export const ColorPickerControl = ChakraColorPicker.Control;
export const ColorPickerValueText = ChakraColorPicker.ValueText;
export const ColorPickerValueSwatch = ChakraColorPicker.ValueSwatch;
export const ColorPickerChannelInput = ChakraColorPicker.ChannelInput;
export const ColorPickerSwatchGroup = ChakraColorPicker.SwatchGroup;
