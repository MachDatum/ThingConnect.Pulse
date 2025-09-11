import { HStack, SegmentGroup } from '@chakra-ui/react';
import { Clock, BarChart3, Calendar } from 'lucide-react';
import type { BucketType } from '@/types/bucket';

export interface BucketSelectorProps {
  value: BucketType;
  onChange: (bucket: BucketType) => void;
  disabled?: boolean;
}

const bucketOptions = [
  {
    value: 'raw' as const,
    label: 'Raw Data',
    icon: <Clock size={16} />,
  },
  {
    value: '15m' as const,
    label: '15 Minute',
    icon: <BarChart3 size={16} />,
  },
  {
    value: 'daily' as const,
    label: 'Daily',
    icon: <Calendar size={16} />,
  },
];

export function BucketSelector({ value, onChange, disabled = false }: BucketSelectorProps) {
  return (
    <SegmentGroup.Root
      value={value}
      onValueChange={details => onChange(details.value as BucketType)}
      size='sm'
      disabled={disabled}
    >
      <SegmentGroup.Indicator />
      <SegmentGroup.Items
        items={bucketOptions.map(option => ({
          value: option.value,
          label: (
            <HStack gap={2}>
              {option.icon}
              {option.label}
            </HStack>
          ),
        }))}
        px={3}
        fontWeight={'light'}
        cursor={'pointer'}
      />
    </SegmentGroup.Root>
  );
}
