export type BucketType = 'raw' | '15m' | 'daily';

export const bucketOptions = [
  { value: 'raw' as const, label: 'Raw Data', description: 'Individual check results' },
  { value: '15m' as const, label: '15 Minutes', description: 'Aggregated per 15-min buckets' },
  { value: 'daily' as const, label: 'Daily', description: 'Aggregated per day' },
];

export const bucketLabels: Record<BucketType, string> = {
  raw: 'Raw Data',
  '15m': '15 Minutes',
  daily: 'Daily',
};
