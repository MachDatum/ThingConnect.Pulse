# ThingConnect Pulse — v1 Project Brief (Canonical)

## 0) One‑liner & Intent

A free, on‑prem, Windows‑service + web UI tool for manufacturing sites to monitor device **availability** (Ethernet/Wi‑Fi, IPv4/IPv6) using a **YAML** configuration, with **live status**, **historical rollups**, and **CSV export**. Designed for wide adoption to promote the ThingConnect brand.

---

## 1) Goals & Non‑Goals

**Goals**

* Track UP/DOWN of networked devices with minimal setup (YAML only).
* Support explicit endpoints, **CIDR/range scans**, and **wildcards**.
* Provide mobile‑friendly live board and historical views.
* Store raw checks and produce **rollups** (1‑min → 15‑min → daily).
* Run on Windows as a **service**; **SQLite** by default; **PostgreSQL** path ready.
* Versioned/backup config with **explicit Apply**; CSV export.
* Clear ThingConnect branding; **Check for updates** in UI.

**Non‑Goals (v1)**

* No WAN/cloud exposure by default, no TLS automation (HTTP only).
* No alerting UI (hooks only), no federation/central console, no localization.

**Confidence:** 0.95

---

## 2) Primary Users & Jobs‑to‑Be‑Done

* **Plant IT/OT Admin:** define targets via YAML; confirm site health; export reports.
* **Production Supervisor:** glance “all green?” view on phone/tablet before/after shift.
* **Maintenance/Controls Engineer:** correlate device outages with line incidents.

**Confidence:** 0.9

---

## 3) Scope of Monitoring (v1)

* **Availability only** (UP/DOWN).
* **Cheap metrics allowed**: record RTT where it falls out naturally (ICMP echo time, TCP connect time, HTTP response time).
* **Probe types**: `icmp`, `tcp` (port), `http` (200 + optional text match).
* **IPv4 + IPv6** supported.
* **Discovery**: explicit host list + **CIDR/range/wildcards** expansion.

**Confidence:** 0.9

---

## 4) High‑Level Architecture

* **Backend**: ASP.NET Core (Minimal APIs).

  * Background worker `IHostedService` for scheduler/monitor.
  * Probe drivers (ICMP/TCP/HTTP) with per‑probe timeouts and retries.
  * Event bus (in‑proc) for future alerting/webhooks.
* **DB**: EF Core model targeting **SQLite** (default) and **PostgreSQL** (scale mode).

  * Identical entities; provider swapped via connection string.
* **Frontend**: React (Vite).

  * SPA serves live board, endpoint detail, history, config Apply & versions.
  * Responsive layout for mobile.
* **Packaging**: Inno Setup installer → Windows Service (`ThingConnectPulseSvc`) + Web UI.
* **Security posture**: bind to localhost + LAN IP; HTTP only for v1.

**Confidence:** 0.9

---

## 5) Scheduler & Probing Model

* **Global tick**: default 10s (configurable).
* **Per‑endpoint cadence**: interval override + **jitter** (±10%) to avoid thundering herds.
* **Retry policy**: e.g., mark DOWN after N consecutive failures; mark UP after M consecutive successes (flap damping).
* **Timeouts**: per probe type (e.g., ICMP 1000–1500 ms, TCP 1500–2000 ms, HTTP 1000–2000 ms defaults).
* **Privilege fallback**: when ICMP restricted, fall back to TCP/HTTP checks.

**Confidence:** 0.85

---

## 6) Discovery & Expansion

Support three inputs in YAML:

* **Explicit hosts**: single IP/hostname with probe type/params.
* **Wildcards**: `10.10.1.*` expands to 1–254 (configurable bounds).
* **CIDR**: e.g., `10.10.1.0/24`.
  **Expansion result** becomes concrete `endpoint` records (tracked individually) and is persisted with labels linking back to the source pattern. Throttle expansion and scan rate to protect networks.

**Confidence:** 0.85

---

## 7) Data Model (Minimum Viable + Rollups)

**Tables**

* `group` (id, name, parent\_id?, color?, sort\_order)
* `endpoint` (id, name, group\_id, type, host, port?, http\_path?, http\_match?, interval\_s, timeout\_ms, retries, expected\_rtt\_ms?, enabled, notes?)
* `check_result_raw` (id, endpoint\_id, ts, status ENUM up/down, rtt\_ms?, error?)
* `outage` (id, endpoint\_id, started\_ts, ended\_ts, duration\_s, last\_error?)
* `rollup_15m` (endpoint\_id, bucket\_ts, up\_pct, avg\_rtt\_ms?, down\_events)
* `rollup_daily` (endpoint\_id, bucket\_date, up\_pct, avg\_rtt\_ms?, down\_events)
* `setting` (k, v)   // schema version, feature flags
* `config_version` (id, applied\_ts, file\_hash, file\_path, actor?, note?)

**Indexes**

* `(endpoint_id, ts)` on raw; partial/filter on `status='down'`.
* `(endpoint_id, bucket_ts)` and `(endpoint_id, bucket_date)` on rollups.
* `(group_id)` on endpoint for filtering.

**Confidence:** 0.9

---

## 8) YAML Configuration (Shape & Example)

**Top‑level keys**

* `version` (int)
* `defaults` → `interval_seconds`, `timeout_ms`, `retries`, `http: { user_agent, expect_text }`
* `groups: [{ id, name }]`
* `targets:`

  * `- type: icmp|tcp|http`

    * `host:` single | `cidr:` | `wildcard:`
    * optional: `port`, `http_path`, `http_match`
    * optional overrides: `interval_seconds`, `timeout_ms`, `retries`, `expected_rtt_ms`
    * `group:` group-id
    * `name:` optional base label (auto‑suffix for expansions)

**Example**

```yaml
version: 1
defaults:
  interval_seconds: 10
  timeout_ms: 1500
  retries: 1
  http:
    user_agent: "ThingConnectPulse/1.0"
    expect_text: ""

groups:
  - { id: "press", name: "Press Shop" }
  - { id: "lab",   name: "Quality Lab" }

targets:
  - type: icmp
    host: 10.10.1.21
    name: "PLC-Press-01"
    group: press
    interval_seconds: 5

  - type: tcp
    wildcard: 10.10.1.*
    port: 5900
    name: "HMI-Press-VNC"
    group: press

  - type: http
    cidr: 10.10.2.0/28
    http_path: /health
    http_match: "OK"
    name: "Lab-HTTP"
    group: lab
```

**Apply flow**

* Validate (schema + semantics) → show **diff summary** (adds/changes/removes) → **Apply**.
* Snapshot previous YAML to a **versions** folder with timestamp/hash.
* Hot‑swap scheduler with minimal disruption.

**Confidence:** 0.9

---

## 9) API Contract (v1)

* `GET /api/status/live?group=&search=&page=&pageSize=`

  * Returns paged live view: endpoint id, name, group, status, last\_change\_ts, rtt\_ms, recent sparkline (last 15 min).
* `GET /api/endpoints/{id}`

  * Endpoint details + recent history window + current config snippet.
* `GET /api/history/endpoint/{id}?from=&to=&bucket=raw|15m|daily`

  * Returns raw/rollup slices; include outages list for range.
* `GET /api/export/csv?scope=endpoint|group&id=&from=&to=&bucket=`

  * Streams CSV.
* `POST /api/config/apply`

  * Body: YAML text or server-side file path. Returns `config_version_id`, diff summary, validation errors if any.
* `GET /api/config/versions` / `GET /api/config/versions/{id}` (download)
* `GET /api/updates/latest`

  * Returns available version info (manual check).

**Confidence:** 0.85

---

## 10) UI/UX (Key Views, Mobile‑Friendly)

* **Live Board**: filter by group; search by name/host; status pills (UP/DOWN/FLAPPING); RTT; last change; 15‑min sparkline; sticky quick filters.
* **Endpoint Detail**: timeline of state changes; RTT chart; outage list; copyable config.
* **History View**: pick endpoint/group + date range; availability %; charts; CSV export.
* **Config & Versions**: YAML editor (read‑only if external edits only) + **Apply** button; version history with download/restore.
* **Settings**: intervals, retention, database backend, update check, branding/about.

**Confidence:** 0.85

---

## 11) Non‑Functional Budgets (v1)

* **Install to green**: ≤ 5 minutes.
* **Performance target**:

  * 100 endpoints @ 10s polls → **CPU < 2%**, **RAM < 200 MB** on modest server.
  * SQLite sustained insert rate comfortably ≥ 10–50 writes/sec.
* **Scale expectations**:

  * SQLite: \~1k endpoints @ 10s cadence with rollups (keep raw write volume throttled).
  * PostgreSQL: 5–20k endpoints with partitioned raw table and tuned indices.
* **Availability**: service auto‑restart; graceful shutdown persists inflight batch.
* **Security**: bind to localhost + LAN; no external exposure by default.

**Confidence:** 0.8

---

## 12) Logging, Observability, CSV

* **App logs**: rolling files; info level by default; JSON toggle.
* **Probe traces**: sampled; include endpoint id, status, rtt, error.
* **CSV export**:

  * Column sets for raw, 15m, daily, outages.
  * Include header with generation timestamp and app version.

**Confidence:** 0.85

---

## 13) Branding & Updates

* **Brand presence**: installer banner, footer “Powered by ThingConnect”, About modal, subtle watermark in CSV header.
* **Updates**: manual “Check for updates” action; shows version and release notes URL (no auto download/phone‑home by default).
* **Telemetry**: deferred; add a disabled setting key; data fields to be defined.

**Confidence:** 0.8

---

## 14) Installer & Upgrade

* Install Windows Service, create `%ProgramData%\ThingConnectPulse\` with `config.yml`, `versions/`, `logs/`, `data/`.
* Bundle SQLite; PostgreSQL provisioning step **planned** (later) but interface placeholder ready.
* Upgrades: back up `config.yml` and SQLite DB; run EF migrations; keep rollback copy.

**Confidence:** 0.85

---

## 15) Risks & Mitigations

* **ICMP blocked in some environments** → fallback to TCP/HTTP probes; document trade‑offs.
* **SQLite growth without retention** → provide prune tool + defaults to suggest 30–90 days; rollups reduce query cost.
* **Scan expansions overwhelm network** → throttle concurrency; limit per‑tick expansions; configurable ceilings.
* **Mobile view clutter** → dedicated compact card view and minimal sparklines.
* **HTTP‑only posture** → explicit warning banner in Settings; easy later lift to HTTPS.

**Confidence:** 0.8

---

## 16) Assumptions (Bounded, Testable) + Confidence

1. Typical plant wants **100–1000 endpoints** monitored initially. **(0.75)**
2. Admins are comfortable editing **YAML in a file** and pressing Apply in UI. **(0.9)**
3. **IPv6** present but less common; dual‑stack support needed. **(0.7)**
4. RTT as a “cheap metric” is sufficient for early performance hints. **(0.85)**
5. **Windows‑first** deployment covers majority of target sites; Linux images later. **(0.8)**
6. Internal networks often **block ICMP**; TCP/HTTP fallback is mandatory. **(0.8)**
7. CSV is the preferred universal export for audits/reports. **(0.9)**

---

## 17) Open Decisions (Parked for v1.x)

* Authentication for UI (none vs simple password vs Windows auth).
* TLS enablement path (self‑signed generation vs bring‑your‑own cert).
* Telemetry fields and opt‑in wording.
* Alerting delivery channels (email/Teams/Webhook) and quiet hours.

**Confidence:** 0.7

---

## 18) v1 Acceptance Criteria (Definition of Done)

* **Config**: YAML‑only source; schema validation; **Apply** with diff preview; automatic version snapshot; restore previous version succeeds.
* **Monitoring**: ICMP/TCP/HTTP; IPv4/IPv6; retries + flap damping; jitter; per‑endpoint intervals.
* **Discovery**: expand `wildcard` and `cidr` into endpoints; throttle scanning; persisted mapping from pattern → endpoints.
* **Data**: raw results written idempotently; **15‑min & daily rollups** computed; outages detected and persisted.
* **UI**: live board (filters/search/sparkline), endpoint detail (timeline/charts), history view (availability %, CSV export), config versions, settings with update check.
* **Install**: single Inno Setup installer; service starts; defaults created; uninstaller cleans up.
* **Docs**: operator quick start, YAML reference, retention/prune guidance.
* **Performance**: meets NFR budgets at 100 endpoints (benchmarked).

**Confidence:** 0.85

---

## 19) Test Plan (Essentials)

* **Unit**: probe drivers (timeouts/retries), rollup math, outage detection edges (touching midnight, partial buckets).
* **Integration**: scheduler cadence, expansion throttling, DB migrations, apply/rollback config, CSV exports integrity.
* **E2E**: install → edit YAML → apply → live board → history → export.
* **Mobile**: viewport tests for live board and endpoint detail.
* **Resilience**: kill service mid‑write; ensure no data loss beyond current batch; rollups idempotent on restart.

**Confidence:** 0.8

---

## 20) Implementation Status (Current Progress) ✅

### **Phase 0-3 Complete** (Foundation through Monitoring Engine)

#### **✅ Data Layer (Phase 2)**
- EF Core entities with SQLite provider configured
- Database migrations for all tables (endpoints, check_result_raw, outages, rollups, etc.)
- ConfigVersion storage with SHA-256 hash-based duplicate detection
- Settings service with memory caching and watermark tracking for rollups

#### **✅ Configuration Management**  
- YAML parsing with YamlDotNet and JSON Schema validation
- POST /api/config/apply endpoint with diff preview and version snapshots
- GET /api/config/versions and GET /api/config/versions/{id} endpoints
- Configuration versioning and restore capabilities tested and operational

#### **✅ Monitoring Engine (Phase 3)**
- **OutageDetectionService**: 2/2 flap damping thresholds with per-endpoint state tracking
- **ProbeService**: ICMP ping, TCP connect, HTTP/HTTPS checks with timeout/retry logic
- **DiscoveryService**: CIDR range expansion ("10.0.0.0/24"), wildcard expansion ("10.0.0.*"), hostname resolution
- **MonitoringBackgroundService**: Continuous monitoring with semaphore-controlled concurrency (100 max)
- Real-time probe execution, outage detection, and database persistence operational

#### **📊 Current Capabilities**
- ✅ All probe types (ICMP, TCP, HTTP) functional with proper error handling
- ✅ Background service monitors endpoints with configurable intervals
- ✅ State transitions and outage records automatically created/closed
- ✅ Raw check results persisted to database with proper EF Core integration
- ✅ Tested with live endpoints (Cloudflare DNS, Google Search) - monitoring operational

#### **🚧 Next Phase Ready**
- Phase 4: API Implementation (GET /api/status/live, history endpoints)
- Phase 5: Background Jobs (15-minute and daily rollups)
- Phase 6: Frontend (React UI for live board, endpoint detail, history views)

### **Deployment Status**
- ASP.NET Core server operational on localhost:8080
- Database created and seeded with sample data  
- Windows service hosting ready for implementation
- Test endpoints available for monitoring engine validation

**Implementation Confidence:** 0.9

---

## 21) Adoption & Success Metrics

* **Install completion rate** (service up within 5 minutes).
* **Active monitored endpoints** count distribution.
* **Weekly active use** (UI visits, CSV exports).
* **Upgrade adoption** rate.

**Confidence:** 0.7

---

## 22) Key Decisions — Rationale & Confidence (Quick Table)

| Area             | Decision                      | Rationale                                   | Confidence |
| ---------------- | ----------------------------- | ------------------------------------------- | ---------- |
| Monitoring scope | Availability + cheap RTT      | Simplicity for v1; RTT is low‑effort signal | 0.9        |
| Config           | YAML file + explicit Apply    | Admin‑friendly, auditable, safe             | 0.9        |
| Discovery        | Hosts + wildcards + CIDR      | Speedy onboarding at plant scale            | 0.85       |
| DB               | SQLite default; PG scale mode | Zero deps; growth path                      | 0.9        |
| UI exposure      | Internal HTTP only            | Security posture; easy setup                | 0.85       |
| Rollups          | 15‑min & daily                | Fast queries; bounded storage               | 0.9        |
| Packaging        | Windows Service + Inno        | Ops‑friendly; one‑click                     | 0.9        |
| Branding         | Visible                       | Product‑led growth goal                     | 0.9        |
| Updates          | Manual check                  | Respect offline/air‑gapped sites            | 0.8        |

---

## 23) Near‑Term Work Products (for the next steps)

* YAML **JSON Schema** + sample configs (hosts, wildcard, CIDR).
* **ERD** and EF Core entity set (+ provider switch notes).
* **API spec** (OpenAPI) matching endpoints above.
* **Scheduler spec** with state machine for flap damping and outage segmentation.
* **Installer map** (files, dirs, service params, upgrades, rollback).
* **UI wireframes** (live board cards/table, endpoint detail, history, config versions).
