import { useEffect, useMemo } from 'react';
import { ComboboxSelect, type ComboboxProps } from './ComboboxSelect';
import { useQuery } from '@tanstack/react-query';
import { StatusService } from '@/api/services/status.service';

interface EndpointSelectProps extends Omit<ComboboxProps, 'items'> {
  defaultToFirst?: boolean;
  setName?: (name: string) => void;
}

export function EndpointSelect({
  selectedValue,
  onChange,
  placeholder = 'Select endpoint...',
  setName,
  defaultToFirst = false,
  ...rest
}: EndpointSelectProps) {
  // Live endpoints
  const { data: liveData, isLoading } = useQuery({
    queryKey: ['live-status'],
    queryFn: () => StatusService.getLiveStatus({ pageSize: 100 }),
    staleTime: 30000,
  });

  const selectedEndpointName = useMemo(() => {
    return (
      liveData?.items?.find(item => item.endpoint.id === selectedValue)?.endpoint?.name ||
      'Unknown Endpoint'
    );
  }, [liveData, selectedValue]);

  useEffect(() => {
    if (setName) {
      setName(selectedEndpointName);
    }
  }, [selectedEndpointName, setName]);

  return (
    <ComboboxSelect
      items={
        liveData?.items.map(item => ({
          label: item.endpoint.name,
          value: item.endpoint.id,
        })) || []
      }
      selectedValue={selectedValue}
      onChange={onChange}
      isLoading={isLoading}
      placeholder={placeholder}
      defaultToFirst={defaultToFirst}
      {...rest}
    />
  );
}
