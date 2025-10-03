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
  currentState: CurrentState;
  lastChangeTs: string;
  sparkline: SparklinePoint[];
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'release' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionUrl?: string | null;
  actionText?: string | null;
  validFrom: string;
  validUntil: string;
  isRead: boolean;
  isShown: boolean;
  created: string;
}

export interface NotificationStats {
  activeNotifications: number;
  unreadNotifications: number;
  lastFetch?: string | null;
  lastFetchSuccess: boolean;
  lastFetchError?: string | null;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
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

export type Classification =
  | -1 // None
  | 0 // Unknown
  | 1 // Network
  | 2 // Service
  | 3 // Intermittent
  | 4 // Performance
  | 5 // PartialService
  | 6 // DnsResolution
  | 7 // Congestion
  | 8; // Maintenance

export interface PrimaryResult {
  type: string;        // "icmp" | "tcp" | "http"
  target: string;      // hostname or IP
  status: 'up' | 'down';
  rttMs?: number | null;
  error?: string | null;
}

export interface FallbackResult {
  attempted: boolean;
  type?: 'icmp'| null;
  target?: string | null;
  status?: 'up' | 'down' | null;
  rttMs?: number | null;
  error?: string | null;
}

export interface CurrentState {
  type: 'icmp' | 'tcp' | 'http';
  target: string;
  status: 'up' | 'down' | 'flapping' | 'serivce';
  rttMs?: number | null;
  classification?: Classification | null;
}

export interface RawCheck {
  ts: string;                 
  classification: Classification;
  primary: PrimaryResult;
  fallback: FallbackResult;
  currentState: CurrentState;
}

export interface Outage {
  startedTs: string;
  endedTs?: string | null;
  durationS?: number | null;
  lastError?: string | null;
  classification: Classification;
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

// Configuration Management Types
export interface ConfigurationVersion {
  id: string;
  appliedTs: string;
  fileHash: string;
  filePath?: string | null;
  actor?: string | null;
  note?: string | null;
}

export interface ConfigurationApplyRequest {
  yamlContent: string;
  dryRun?: boolean;
}

export interface ConfigurationDiff {
  type: 'add' | 'update' | 'remove';
  entity: 'endpoint' | 'group' | 'setting';
  name: string;
  details?: Record<string, unknown>;
}

export interface ConfigurationApplyResponse {
  configVersionId: string;
  added: number;
  updated: number;
  removed: number;
  warnings: string[];
}

// Error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Validation error types (matching backend DTOs)
export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
  line?: number;
  column?: number;
}

export interface ValidationErrorsDto {
  message: string;
  errors: ValidationError[];
}

// User Management Types
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: 'User' | 'Administrator';
  createdAt: string;
  lastLoginAt?: string | null;
  isActive: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'User' | 'Administrator';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  isActive?: boolean;
}

export interface ChangeRoleRequest {
  role: 'User' | 'Administrator';
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface UsersListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
