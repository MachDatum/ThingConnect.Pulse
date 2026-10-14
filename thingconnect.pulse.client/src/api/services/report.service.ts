import { apiClient } from '../client';

export type ReportInterval = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface AvailabilityReportParams {
  from: string; // local calendar date, yyyy-MM-dd (inclusive)
  to: string; // local calendar date, yyyy-MM-dd (inclusive)
  interval: ReportInterval;
  groupIds?: string[];
}

export interface AvailabilityFigures {
  uptimePct: number | null;
  downtimeMinutes: number | null;
  downEvents: number;
  avgRttMs: number | null;
  mttrSeconds: number | null;
  mtbfSeconds: number | null;
  longestOutageSeconds: number | null;
  coveragePct: number | null;
}

export interface AvailabilitySummary {
  endpointCount: number;
  endpointsDown: number;
  endpointsWithOutage: number;
  /** Average downtime per endpoint with data — the overall downtime is a sum across endpoints. */
  avgDowntimeMinutesPerEndpoint: number | null;
  overall: AvailabilityFigures;
  groups: { name: string; endpointCount: number; figures: AvailabilityFigures }[];
}

export const INTERVAL_FILE_LABELS: Record<ReportInterval, string> = {
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
};

export function availabilityReportFilename(params: AvailabilityReportParams): string {
  return `Availability_Report_${params.from}_to_${params.to}_${INTERVAL_FILE_LABELS[params.interval]}.xlsx`;
}

function rangeQuery(params: Omit<AvailabilityReportParams, 'interval'>): URLSearchParams {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  (params.groupIds ?? []).forEach(id => query.append('groupIds', id));
  return query;
}

export class ReportService {
  /**
   * Download the Availability Report (.xlsx): a Summary sheet plus a block per
   * day/week/month/year (or one hourly pivot sheet per endpoint).
   */
  static async downloadAvailability(params: AvailabilityReportParams): Promise<void> {
    const query = rangeQuery(params);
    query.set('interval', params.interval);
    return apiClient.download(
      `/api/reports/availability?${query}`,
      availabilityReportFilename(params)
    );
  }

  /**
   * Headline figures for the selected range/groups — the same numbers as the workbook's Summary sheet.
   */
  static async getAvailabilitySummary(
    params: Omit<AvailabilityReportParams, 'interval'>
  ): Promise<AvailabilitySummary> {
    return apiClient.get<AvailabilitySummary>(
      `/api/reports/availability/summary?${rangeQuery(params)}`
    );
  }
}
