// API Types based on OpenAPI specification
// This file contains TypeScript interfaces for the Pulse API responses

export interface LiveEndpoint {
  id: string
  name: string
  host: string
  group?: string
  status: 'UP' | 'DOWN' | 'FLAPPING'
  rtt?: number
  lastCheck?: string
  sparkline?: number[]
  config: {
    type: 'ICMP' | 'TCP' | 'HTTP' | 'HTTPS'
    port?: number
    path?: string
    timeout?: number
    interval?: number
  }
}

export interface PagedLive {
  data: LiveEndpoint[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
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