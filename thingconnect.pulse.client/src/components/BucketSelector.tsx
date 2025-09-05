import { HStack } from '@chakra-ui/react';
import { RadioCardItem, RadioCardRoot } from '@/components/ui/radio-card';
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
    description: 'Individual check results',
    icon: <Clock size={24} />,
  },
  {
    value: '15m' as const,
    label: '15 Minute',
    description: 'Aggregated every 15 minutes',
    icon: <BarChart3 size={24} />,
  },
  {
    value: 'daily' as const,
    label: 'Daily',
    description: 'Daily summaries',
    icon: <Calendar size={24} />,
  },
];

export function BucketSelector({ value, onChange, disabled = false }: BucketSelectorProps) {
  return (
    <RadioCardRoot
      value={value}
      onValueChange={details => onChange(details.value as BucketType)}
      orientation='horizontal'
      size='sm'
      disabled={disabled}
    >
      <HStack gap={3}>
        {bucketOptions.map(option => (
          <RadioCardItem
            key={option.value}
            value={option.value}
            flex='1'
            minW='0'
            icon={option.icon}
            label={option.label}
            description={option.description}
            indicator={null}
          />
        ))}
      </HStack>
    </RadioCardRoot>
  );
}
