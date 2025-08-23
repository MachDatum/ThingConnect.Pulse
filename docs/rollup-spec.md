# Rollup and Outage Detection Spec (v1)

## Overview
Pulse records raw probe results per endpoint and derives:
- 15-minute rollups (`rollup_15m`)
- Daily rollups (`rollup_daily`)
- Outage windows (`outage`)

RTT is included where naturally available (ICMP echo, TCP connect, HTTP request).

## Outage Detection & Flap Damping
- Maintain per-endpoint in-memory state: success/fail streaks.
- Thresholds (default): 2 fails → DOWN; 2 successes → UP.
- On DOWN transition: open `outage` with `started_ts` and `last_error`.
- On UP transition: close outage with `ended_ts` and compute `duration_s`.

### C# Pseudocode
```csharp
public sealed class MonitorState
{
    public UpDown? LastPublicStatus { get; set; }
    public int FailStreak { get; set; }
    public int SuccessStreak { get; set; }
    public DateTimeOffset? LastChangeTs { get; set; }
    public long? OpenOutageId { get; set; }
}
```

## 15-Minute Rollup
- Bucket alignment: 00, 15, 30, 45 of each hour.
- `UpPct = 100 * (#up) / (#rows)`
- `AvgRttMs = avg(rtt_ms WHERE not null)`
- `DownEvents = count(up→down transitions in bucket)`

### PostgreSQL SQL
```sql
with base as (
  select
    endpoint_id,
    ts,
    status,
    rtt_ms,
    date_trunc('minute', ts)
      - (extract(minute from ts)::int % 15) * interval '1 minute' as bucket_ts,
    lag(status) over (partition by endpoint_id order by ts) as prev_status
  from check_result_raw
  where endpoint_id = :eid and ts > :from_ts and ts <= :to_ts
),
agg as (
  select
    endpoint_id,
    bucket_ts,
    100.0 * avg(case when status = 'up' then 1.0 else 0.0 end) as up_pct,
    avg(nullif(rtt_ms,0)) as avg_rtt_ms,
    count(*) filter (where prev_status = 'up' and status = 'down') as down_events
  from base
  group by endpoint_id, bucket_ts
)
insert into rollup_15m (endpoint_id, bucket_ts, up_pct, avg_rtt_ms, down_events)
select endpoint_id, bucket_ts, up_pct, avg_rtt_ms, down_events
from agg
on conflict (endpoint_id, bucket_ts)
do update set up_pct = excluded.up_pct,
              avg_rtt_ms = excluded.avg_rtt_ms,
              down_events = excluded.down_events;
```

## Daily Rollup
Compute over site-local day if needed; default is UTC.

### PostgreSQL SQL
```sql
with base as (
  select
    endpoint_id,
    (ts at time zone 'UTC')::date as bucket_date,
    status,
    rtt_ms,
    lag(status) over (partition by endpoint_id order by ts) as prev_status
  from check_result_raw
  where endpoint_id = :eid and ts >= :from_ts and ts < :to_ts
),
agg as (
  select
    endpoint_id,
    bucket_date,
    100.0 * avg(case when status = 'up' then 1.0 else 0.0 end) as up_pct,
    avg(nullif(rtt_ms,0)) as avg_rtt_ms,
    sum(case when prev_status='up' and status='down' then 1 else 0 end) as down_events
  from base
  group by endpoint_id, bucket_date
)
insert into rollup_daily (endpoint_id, bucket_date, up_pct, avg_rtt_ms, down_events)
select * from agg
on conflict (endpoint_id, bucket_date)
do update set up_pct = excluded.up_pct,
              avg_rtt_ms = excluded.avg_rtt_ms,
              down_events = excluded.down_events;
```

## SQLite Fallback
Use the C# aggregation (LINQ + grouping) to remain portable.

## Retention & Pruning
- Recommend keeping raw for 30–90 days in SQLite deployments.
- Provide a prune task that removes raw older than N days while retaining rollups.

## Confidence
- Algorithms: 0.85
- SQL: 0.9 (PostgreSQL), 0.8 (SQLite fallback)
