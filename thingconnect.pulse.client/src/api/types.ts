// API Types based on OpenAPI specification
// This file contains TypeScript interfaces for the Pulse API responses

export interface Group {
  id: string;
  name: string;
  parentId?: string | null;
  color?: string | null;
}

export interface Endpoint {
  id: string;
  name: string;
  group: Group;
  type: 'icmp' | 'tcp' | 'http';
  host: string;
  port?: number | null;
  httpPath?: string | null;
  httpMatch?: string | null;
  intervalSeconds: number;
  timeoutMs: number;
  retries: number;
  enabled: boolean;
}

export interface SparklinePoint {
  ts: string;
  s: 'u' | 'd';
}

export interface LiveStatusItem {
  endpoint: Endpoint;
  status: 'up' | 'down' | 'flapping';
  rttMs?: number | null;
  lastChangeTs: string;
  sparkline: SparklinePoint[];
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PagedLive {
  meta: PageMeta;
  items: LiveStatusItem[];
}

export interface StateChange {
  timestamp: string;
  previousState: 'UP' | 'DOWN' | 'FLAPPING';
  newState: 'UP' | 'DOWN' | 'FLAPPING';
  rtt?: number;
  error?: string;
}

export interface RawCheck {
  ts: string;
  status: 'up' | 'down';
  rttMs?: number | null;
  error?: string | null;
}

export interface Outage {
  startedTs: string;
  endedTs?: string | null;
  durationS?: number | null;
  lastError?: string | null;
}

export interface EndpointDetail {
  endpoint: Endpoint;
  recent: RawCheck[];
  outages: Outage[];
}

export interface HistoryDataPoint {
  timestamp: string;
  rtt?: number;
  status: 'UP' | 'DOWN' | 'FLAPPING';
  error?: string;
}

export interface RollupBucket {
  bucketTs: string;
  upPct: number;
  avgRttMs?: number | null;
  downEvents: number;
}

export interface DailyBucket {
  bucketDate: string;
  upPct: number;
  avgRttMs?: number | null;
  downEvents: number;
}

export interface HistoryResponse {
  endpoint: Endpoint;
  raw: RawCheck[];
  rollup15m: RollupBucket[];
  rollupDaily: DailyBucket[];
  outages: Outage[];
}

// Request parameter types
export interface LiveStatusParams {
  group?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface EndpointDetailParams {
  id: string;
  windowMinutes?: number;
}

export interface HistoryParams {
  id: string;
  from: string;
  to: string;
  bucket?: 'raw' | '15m' | 'daily';
}

export interface ExportParams {
  scope: 'endpoint' | 'group';
  id: string;
  from: string;
  to: string;
  bucket?: 'raw' | '15m' | 'daily';
}

// Error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
