import { Box } from '@chakra-ui/react';
import type { LiveStatusItem } from '@/api/types';
import { StatusTable } from './StatusTable';
import { StatusGroupAccordion } from './StatusGroupAccordion';
import { GroupAccordion } from './GroupAccordion';
import { StatusAccordion } from './StatusAccordion';

type GroupedEndpointsType =
  | LiveStatusItem[]
  | Record<string, LiveStatusItem[]>
  | Record<string, Record<string, LiveStatusItem[]>>;

type EndpointAccordionProps = {
  groupedEndpoints: GroupedEndpointsType | null;
  isLoading: boolean;
  groupByOptions: string[];
};

function isGroupedByStatusAndGroup(
  endpoints: any
): endpoints is Record<string, Record<string, LiveStatusItem[]>> {
  return (
    typeof endpoints === 'object' &&
    !Array.isArray(endpoints) &&
    Object.values(endpoints).every(
      value =>
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.values(value as any).every(Array.isArray)
    )
  );
}

export function EndpointAccordion({
  groupedEndpoints,
  isLoading,
  groupByOptions,
}: EndpointAccordionProps) {
  return (
    <>
      {groupedEndpoints !== null ? (
        Array.isArray(groupedEndpoints) ? (
          <Box pb={4}>
            <StatusTable items={groupedEndpoints} isLoading={isLoading} />
          </Box>
        ) : isGroupedByStatusAndGroup(groupedEndpoints) ? (
          <StatusGroupAccordion groupedEndpoints={groupedEndpoints} isLoading={isLoading} />
        ) : groupByOptions.includes('group') ? (
          <GroupAccordion groupedEndpoints={groupedEndpoints} isLoading={isLoading} />
        ) : groupByOptions.includes('status') ? (
          <StatusAccordion groupedEndpoints={groupedEndpoints} isLoading={isLoading} />
        ) : (
          <StatusTable items={Object.values(groupedEndpoints).flat()} isLoading={isLoading} />
        )
      ) : (
        <StatusTable items={groupedEndpoints} isLoading={isLoading} />
      )}
    </>
  );
}
