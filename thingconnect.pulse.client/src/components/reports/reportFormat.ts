import type { ReportInterval } from '@/api/services/report.service';

// Must match XlsxReportWriter.GoodUptimePct / WarnUptimePct so the preview and the workbook agree.
export const GOOD_UPTIME_PCT = 99.5;
export const WARN_UPTIME_PCT = 95;

// Must match ReportDataService.MaxHourlyDays / MaxDailyDays / MaxRangeDays on the server.
export const MAX_DAYS: Record<ReportInterval, number> = {
  hour: 31,
  day: 366,
  week: 5 * 366,
  month: 5 * 366,
  year: 5 * 366,
};

export function uptimePalette(pct: number | null | undefined): 'green' | 'orange' | 'red' | 'gray' {
  if (pct == null) return 'gray';
  if (pct >= GOOD_UPTIME_PCT) return 'green';
  if (pct >= WARN_UPTIME_PCT) return 'orange';
  return 'red';
}

export function formatPct(pct: number | null | undefined, digits = 2): string {
  return pct == null ? '—' : `${pct.toFixed(digits)}%`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const s = Math.round(seconds);
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3_600);
  const m = Math.floor((s % 3_600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function startOfWeek(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7)); // Monday
}

/** Local calendar date as yyyy-MM-dd (not toISOString, which would shift to UTC). */
export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysInclusive(from: string, to: string): number {
  return Math.round((fromDateInput(to).getTime() - fromDateInput(from).getTime()) / 86_400_000) + 1;
}

const shortDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
const longDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

export function formatRange(from: string, to: string): string {
  const a = fromDateInput(from);
  const b = fromDateInput(to);
  if (from === to) return longDate.format(a);
  return a.getFullYear() === b.getFullYear()
    ? `${shortDate.format(a)} – ${longDate.format(b)}`
    : `${longDate.format(a)} – ${longDate.format(b)}`;
}

/**
 * Column-block labels the workbook will have for this range/interval (mirrors ReportDataService.BuildPeriods,
 * used only to sketch the layout in the preview).
 */
export function periodLabels(from: string, to: string, interval: ReportInterval): string[] {
  const end = addDays(fromDateInput(to), 1);
  const labels: string[] = [];
  let cursor = fromDateInput(from);
  while (cursor < end && labels.length < 2000) {
    let next: Date;
    switch (interval) {
      case 'week':
        next = addDays(startOfWeek(cursor), 7);
        break;
      case 'month':
        next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        break;
      case 'year':
        next = new Date(cursor.getFullYear() + 1, 0, 1);
        break;
      default:
        next = addDays(cursor, 1);
    }
    if (next > end) next = end;
    const last = addDays(next, -1);
    labels.push(
      interval === 'month' && cursor.getDate() === 1 && next.getDate() === 1
        ? monthYear.format(cursor)
        : interval === 'year'
          ? String(cursor.getFullYear())
          : interval === 'week'
            ? `${shortDate.format(cursor)} – ${shortDate.format(last)}`
            : shortDate.format(cursor)
    );
    cursor = next;
  }
  return labels;
}
