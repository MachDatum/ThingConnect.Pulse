// API Types based on OpenAPI specification
// This file contains TypeScript interfaces for the Pulse API responses

export interface Group {
  id: string
  name: string
  parent_id?: string | null
  color?: string | null
}

export interface Endpoint {
  id: string
  name: string
  group: Group
  type: 'icmp' | 'tcp' | 'http'
  host: string
  port?: number | null
  http_path?: string | null
  http_match?: string | null
  interval_seconds: number
  timeout_ms: number
  retries: number
  enabled: boolean
}

export interface SparklinePoint {
  ts: string
  s: 'u' | 'd'
}

export interface LiveStatusItem {
  endpoint: Endpoint
  status: 'up' | 'down' | 'flapping'
  rtt_ms?: number | null
  last_change_ts: string
  sparkline: SparklinePoint[]
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
}

export interface PagedLive {
  meta: PageMeta
  items: LiveStatusItem[]
}

export interface StateChange {
  timestamp: string
  previousState: 'UP' | 'DOWN' | 'FLAPPING'
  newState: 'UP' | 'DOWN' | 'FLAPPING'
  rtt?: number
  error?: string
}

export interface Outage {
  id: string
  startTime: string
  endTime?: string
  duration?: number
  affectedChecks: number
}

export interface EndpointDetail {
  id: string
  name: string
  host: string
  group?: string
  currentStatus: 'UP' | 'DOWN' | 'FLAPPING'
  config: {
    type: 'ICMP' | 'TCP' | 'HTTP' | 'HTTPS'
    port?: number
    path?: string
    timeout?: number
    interval?: number
  }
  recentStateChanges: StateChange[]
  recentOutages: Outage[]
  rttHistory: Array<{
    timestamp: string
    rtt?: number
  }>
}

export interface HistoryDataPoint {
  timestamp: string
  rtt?: number
  status: 'UP' | 'DOWN' | 'FLAPPING'
  error?: string
}

export interface HistoryResponse {
  endpointId: string
  from: string
  to: string
  bucket: 'raw' | '15m' | 'daily'
  data: HistoryDataPoint[]
  availabilityPercentage?: number
  totalUptime?: number
  totalDowntime?: number
}

// Request parameter types
export interface LiveStatusParams {
  group?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface EndpointDetailParams {
  id: string
  windowMinutes?: number
}

export interface HistoryParams {
  id: string
  from: string
  to: string
  bucket?: 'raw' | '15m' | 'daily'
}

export interface ExportParams {
  scope: 'endpoint' | 'group'
  id: string
  from: string
  to: string
  bucket?: 'raw' | '15m' | 'daily'
}

// Error response type
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}