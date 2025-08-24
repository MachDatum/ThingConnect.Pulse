import { HStack, Text } from '@chakra-ui/react';
import { RadioCardItem, RadioCardLabel, RadioCardRoot } from '@/components/ui/radio-card';
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
    icon: Clock,
  },
  {
    value: '15m' as const,
    label: '15 Minute',
    description: 'Aggregated every 15 minutes',
    icon: BarChart3,
  },
  {
    value: 'daily' as const,
    label: 'Daily',
    description: 'Daily summaries',
    icon: Calendar,
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
        {bucketOptions.map(option => {
          const Icon = option.icon;
          return (
            <RadioCardItem key={option.value} value={option.value} flex='1' minW='0'>
              <RadioCardLabel
                display='flex'
                flexDirection='column'
                alignItems='center'
                gap={2}
                p={3}
              >
                <Icon size={20} />
                <div>
                  <Text fontWeight='semibold' fontSize='sm' lineHeight='tight'>
                    {option.label}
                  </Text>
                  <Text
                    fontSize='xs'
                    color='gray.600'
                    _dark={{ color: 'gray.400' }}
                    lineHeight='tight'
                    textAlign='center'
                  >
                    {option.description}
                  </Text>
                </div>
              </RadioCardLabel>
            </RadioCardItem>
          );
        })}
      </HStack>
    </RadioCardRoot>
  );
}
