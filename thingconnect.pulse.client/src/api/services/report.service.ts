import { apiClient } from '../client';

export interface ReportParams {
  from: string; // ISO 8601 date string
  to: string; // ISO 8601 date string
  groupIds?: string[];
}

function buildQuery(params: ReportParams): URLSearchParams {
  const searchParams = new URLSearchParams({ from: params.from, to: params.to, format: 'xlsx' });
  (params.groupIds ?? []).forEach(id => searchParams.append('groupIds', id));
  return searchParams;
}

export class ReportService {
  /**
   * Download the Machine Availability Detail report (.xlsx).
   */
  static async downloadMachineAvailability(params: ReportParams): Promise<void> {
    const query = buildQuery(params);
    const filename = `machine-availability-${params.from.slice(0, 10)}-${params.to.slice(0, 10)}.xlsx`;
    return apiClient.download(`/api/reports/machine-availability?${query}`, filename);
  }

  /**
   * Download the Executive Health Summary report (.xlsx).
   */
  static async downloadExecutiveSummary(params: ReportParams): Promise<void> {
    const query = buildQuery(params);
    const filename = `executive-summary-${params.from.slice(0, 10)}-${params.to.slice(0, 10)}.xlsx`;
    return apiClient.download(`/api/reports/executive-summary?${query}`, filename);
  }
}
