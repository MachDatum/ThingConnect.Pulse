# Branch `user/sgl` — changes, deployment and next steps

Branched from `fix-2` (which carries `fix-1`) and up to date with `master` as of 14 Oct 2026.
Deployed to the customer site server on 14 Oct 2026 via the Inno installer.

## Commits on this branch (not in `master`)

| Commit | Summary |
|---|---|
| `c08b483` | Dev: Vite default port 55605 → **5173** |
| `ab756b5` | **Availability reports** (day / week / month / year / hour) with live preview |
| `8eafba5` | Dev: Kestrel dev endpoint 8080 → **8090** |
| `99898de` | Installer: wait for the service to actually stop before replacing files |
| `a99be5b` | Offline Monaco editor, notification request loop, dark-mode inputs, dev port 8090 |
| `3ac6945` | First XLSX reports (since replaced by `ab756b5`) |
| `387e974` … `e61a4cc` | From `fix-1` / `fix-2`: SQLite WAL mode, batched check-result write queue, monitoring thundering-herd fix, single-query flap detection, rollup/history full-scan fixes, prune background service, cookie auth fixes |

## What changed for users

### Availability Report (Reports page)
- One report replaces *Machine Availability* and *Executive Summary*.
- **Break down by:** Hourly (≤ 31 days), Daily (≤ 366 days), Weekly, Monthly, Yearly; period presets (Today … This year); group filter.
- **Live preview** before download: uptime, avg downtime per endpoint, down events, MTTR, avg response, coverage, uptime by group.
- **Workbook:**
  - *Summary* — headline KPIs, by-group table, 10 least available endpoints, metric definitions.
  - *Availability* (day/week/month/year) — endpoints grouped with group subtotals; a column block per period (Uptime %, Downtime, Down events, Avg RTT) and a Total block adding MTTR, MTBF, longest outage, coverage. Uptime coloured green ≥ 99.5 %, amber ≥ 95 %, red below.
  - Hourly — one sheet per endpoint (plus all endpoints): dates × 00:00–23:00 + Day total.
- **Correctness fixes vs. the old reports:** periods are **local** days (old reports used UTC days, 05:30–05:30 IST); down events / MTTR come from the outage table (15-min rollups miss transitions across bucket boundaries); monitoring gaps show as **coverage** instead of counting as up.
- **Performance:** a year of real site data (79 endpoints, 1.65 M rollups) builds in ~2.5 s.

### Metric definitions
| Metric | Meaning |
|---|---|
| Uptime % | Share of *monitored* time the endpoint was up |
| Avg downtime per endpoint | Average down time per endpoint with data (the total is a sum across endpoints) |
| Down events | Outages started in the period (DOWN = 2 consecutive failed checks) |
| MTTR | Average duration of outages that started **and** recovered in the range |
| MTBF | Up time ÷ number of outages |
| Longest outage | Longest single outage within the range (ongoing ones count up to now) |
| Coverage % | Share of the period with monitoring data (gaps = service stopped, endpoint added later, or older than 365-day 15-min retention) |

### Other fixes
- **Configuration editor works offline** — Monaco is bundled instead of loaded from the jsdelivr CDN.
- **Notification request loop fixed** — `mark-shown` / `notification` were firing 10+ times a second.
- **Dark mode** — typed text visible in login/onboarding inputs; group multi-select now has checkboxes, a raised dropdown and a "n of N selected" header (also on the Dashboard filters).
- **Dependencies** — `@visx/*` 3.12 → 4.0 (official React 19 support; fixes `npm install` ERESOLVE).

### API changes
- **Added:** `GET /api/reports/availability?from=yyyy-MM-dd&to=yyyy-MM-dd&interval=hour|day|week|month|year&groupIds=…` (XLSX) and `GET /api/reports/availability/summary?from&to&groupIds` (JSON).
- **Removed (breaking):** `/api/reports/machine-availability`, `/api/reports/executive-summary`.

## Developer setup

| | Command | URL |
|---|---|---|
| Backend | `cd ThingConnect.Pulse.Server; dotnet run` | http://localhost:8090 |
| Frontend | `cd thingconnect.pulse.client; npm run dev` | https://localhost:5173 (proxies `/api` → 8090) |
| Tests | `DOTNET_ROLL_FORWARD=Major dotnet test ThingConnect.Pulse.Tests` | 28 tests; the test project targets net9.0 |

Notes:
- Login, users and all data live in `C:\ProgramData\ThingConnect.Pulse\data\pulse.db` (no default credentials; an empty DB sends you to `/onboarding`).
- What is monitored lives in the DB (`endpoint`/`group` tables) and only changes via **Configuration → Apply**; `config\config.yaml` is an unused placeholder and nothing watches YAML files.
- A copy of a site database on a dev PC gets polluted as soon as the local backend starts probing plant IPs it cannot reach.

## Deploying to the site server

The service is `ThingConnectPulseSvc`, installed in `C:\Program Files (x86)\ThingConnect.Pulse`; data is in `C:\ProgramData\ThingConnect.Pulse` (~5.9 GB). No DB migrations since `master`.

1. **Build** (dev PC): `.\build-installer.ps1 -InnoSetupPath "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"` → `installer\ThingConnect.Pulse.Setup 1.0.0.exe`.
2. **Back up** (server, admin PowerShell):
   ```powershell
   Stop-Service ThingConnectPulseSvc
   $Backup = "D:\PulseBackup\" + (Get-Date -Format "yyyyMMdd-HHmm")
   New-Item -ItemType Directory -Force $Backup | Out-Null
   Copy-Item "C:\ProgramData\ThingConnect.Pulse" "$Backup\ProgramData" -Recurse
   Copy-Item "C:\Program Files (x86)\ThingConnect.Pulse" "$Backup\App" -Recurse
   ```
3. **Install:** run the installer as administrator; keep the folder `C:\Program Files (x86)\ThingConnect.Pulse`.
4. **Verify:** service `Running`, no `[ERR]`/`[FTL]` in the latest `logs\pulse-*.log`, then `http://localhost:8090` with Ctrl+F5 — login, dashboard, history, configuration editor, Reports.
5. **Rollback:** stop the service, copy `$Backup\App\*` (and `$Backup\ProgramData\*` only if data is affected) back, start the service.

The prune service keeps 60 days of raw checks and 365 days of 15-min rollups — the same window the site already had.

## Open items
- **Daily emailed availability report** — next feature. Reuse `ReportDataService` + `XlsxReportWriter`; model scheduling/recipients on `DailyConsumptionReport` in the ThingConnect repo; SMTP must be site-configurable and must never affect monitoring.
- Decide whether to keep, remove or replace the *What's in the workbook* card on the Reports page.
- Installer version is still `1.0.0` — bump `AppVersion` in `setup.iss` so upgrades are visible in Apps & features.
- `ThingConnect.Pulse.Tests` targets net9.0 while the server targets net8.0; Release builds of the test project fail on 4 existing nullable warnings in `ConfigurationValidationTests.cs`.
- Marketing blog posts still mention port 8080.
