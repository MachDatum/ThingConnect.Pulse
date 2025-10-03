import { apiClient } from '../client';
import type { HistoryResponse } from '../types';

export interface HistoryParams {
  id: string;
  from: string; // ISO 8601 date string
  to: string; // ISO 8601 date string
  bucket?: 'raw' | '15m' | 'daily';
}

export interface CSVExportParams {
  scope: 'endpoint' | 'group';
  id: string;
  from: string;
  to: string;
  bucket?: 'raw' | '15m' | 'daily';
}

export class HistoryService {
  /**
   * Get historical data for a specific endpoint
   */
  static async getEndpointHistory(params: HistoryParams): Promise<HistoryResponse> {
    const { id, from, to, bucket = '15m' } = params;

    const url = `/api/history/endpoint/${id}`;
    const searchParams = new URLSearchParams({
      from,
      to,
      bucket,
    });

    return await apiClient.get<HistoryResponse>(`${url}?${searchParams}`);
  }

  /**
   * Generate and download CSV export
   * Since backend /api/export/csv is not implemented, we'll generate client-side
   */
  static async exportCSV(params: CSVExportParams): Promise<void> {
    try {
      // Get the data first using history API
      const historyData = await this.getEndpointHistory({
        id: params.id,
        from: params.from,
        to: params.to,
        bucket: params.bucket || '15m',
      });

      // Generate CSV content
      const csvContent = this.generateCSVContent(historyData, params.bucket || '15m');

      // Create and trigger download
      this.downloadCSV(csvContent, `endpoint-${params.id}-history.csv`);
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    }
  }

  /**
   * Generate CSV content from history data
   */
  private static generateCSVContent(data: HistoryResponse, bucket: string): string {
    const lines: string[] = [];

    // Add header with metadata
    lines.push(`# ThingConnect Pulse - Historical Data Export`);
    lines.push(`# Endpoint: ${data.endpoint.name} (${data.endpoint.host})`);
    lines.push(`# Data Bucket: ${bucket}`);
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Determine which data to export based on bucket
    if (bucket === 'raw' && data.raw.length > 0) {
      lines.push(
        'Timestamp,Primary Status,Primary RTT (ms),Primary Error,Fallback Status,Fallback RTT (ms),Fallback Error'
      );
      data.raw.forEach(check => {
        lines.push(
          [
            check.ts,
            check.primary.status,
            check.primary.rttMs || '',
            check.primary.error ? `"${check.primary.error.replace(/"/g, '""')}"` : '',
            check.fallback.status,
            check.fallback.rttMs || '',
            check.fallback.error ? `"${check.fallback.error.replace(/"/g, '""')}"` : '',
          ].join(',')
        );
      });
    } else if (bucket === '15m' && data.rollup15m.length > 0) {
      lines.push('Bucket Timestamp,Uptime %,Avg Response Time (ms),Down Events');
      data.rollup15m.forEach(bucket => {
        lines.push(
          [bucket.bucketTs, bucket.upPct.toFixed(2), bucket.avgRttMs || '', bucket.downEvents].join(
            ','
          )
        );
      });
    } else if (bucket === 'daily' && data.rollupDaily.length > 0) {
      lines.push('Date,Uptime %,Avg Response Time (ms),Down Events');
      data.rollupDaily.forEach(bucket => {
        lines.push(
          [
            bucket.bucketDate,
            bucket.upPct.toFixed(2),
            bucket.avgRttMs || '',
            bucket.downEvents,
          ].join(',')
        );
      });
    }

    // Add outages section if present
    if (data.outages.length > 0) {
      lines.push('');
      lines.push('# Outages');
      lines.push('Started,Ended,Duration (seconds),Last Error');
      data.outages.forEach(outage => {
        lines.push(
          [
            outage.startedTs,
            outage.endedTs || 'Ongoing',
            outage.durationS || '',
            outage.lastError ? `"${outage.lastError.replace(/"/g, '""')}"` : '',
          ].join(',')
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Trigger browser download of CSV content
   */
  private static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper to format date for API calls
   */
  static formatDateForAPI(date: Date): string {
    return date.toISOString();
  }

  /**
   * Helper to get default date range (last 24 hours)
   */
  private static formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  static getDefaultDateRange(): { from: string; to: string } {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      from: HistoryService.formatDateForInput(yesterday),
      to: HistoryService.formatDateForInput(now),
    };
  }
}
