'use client';

import { Tabs as ChakraTabs } from '@chakra-ui/react';
import * as React from 'react';

interface TabsContentProps extends ChakraTabs.ContentProps {}

export const TabsContent = function TabsContent({
  ref,
  ...props
}: TabsContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return <ChakraTabs.Content ref={ref} {...props} />;
};

interface TabsListProps extends ChakraTabs.ListProps {}

export const TabsList = function TabsList({
  ref,
  ...props
}: TabsListProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return <ChakraTabs.List ref={ref} {...props} />;
};

interface TabsTriggerProps extends ChakraTabs.TriggerProps {}

export const TabsTrigger = function TabsTrigger({
  ref,
  ...props
}: TabsTriggerProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  return <ChakraTabs.Trigger ref={ref} {...props} />;
};

interface TabsIndicatorProps extends ChakraTabs.IndicatorProps {}

export const TabsIndicator = function TabsIndicator({
  ref,
  ...props
}: TabsIndicatorProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return <ChakraTabs.Indicator ref={ref} {...props} />;
};

interface TabsContentGroupProps extends ChakraTabs.ContentGroupProps {}

export const TabsContentGroup = function TabsContentGroup({
  ref,
  ...props
}: TabsContentGroupProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return <ChakraTabs.ContentGroup ref={ref} {...props} />;
};

export const TabsRoot = ChakraTabs.Root;
export const TabsRootProvider = ChakraTabs.RootProvider;
