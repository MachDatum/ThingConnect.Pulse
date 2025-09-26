# 📡 ICMP Fallback – ThingConnect Pulse

## 📝 Description

ICMP fallback enhances outage classification accuracy by automatically performing ICMP ping tests when TCP or HTTP probes fail.  
This enables **precise root cause analysis** by distinguishing between:

- 🟠 **Service Outage** → Service down, host still reachable  
- 🔴 **Network Outage** → Host completely unreachable  
- 🟡 **Mixed Outage** → Flapping or unstable network  

Without fallback, failed HTTP probes are ambiguous (could mean web service down *or* full network isolation).  
With ICMP fallback, ThingConnect Pulse intelligently classifies failures for **better diagnostics and reduced false positives**.

---

## 🎯 Scope of Work

### Core Implementation
- Add automatic ICMP fallback logic on TCP/HTTP failures  
- Extend `CheckResult` model with fallback probe results  
- Implement outage classification system (Network, Service, Mixed, Unknown)  
- Update outage detection to consider fallback outcomes  

### Probe Enhancement
- Modify `ProbeService` to run ICMP fallback after failed TCP/HTTP  
- Configurable fallback timeout (default **500ms**)  
- Respect concurrency limits & jitter scheduling  
- Preserve original error messages + add fallback context  

### Database Schema
- Extend **`CheckResultRaw`** with fallback probe fields  
- Add **`OutageClassification`** enum  
- Update **`Outage`** table with classification results  
- Maintain backwards compatibility  

### UI Integration
- Dashboard shows classification badges (🔴, 🟠, 🟡)  
- Endpoint details display fallback probe results  
- History view filter by outage type  
- CSV exports include `OutageType` + `FallbackResult`  

---

## ✅ Acceptance Criteria

### Functional
- TCP/HTTP failures trigger ICMP fallback within **2s**  
- ICMP fallback timeout = **500ms** (configurable)  
- Correct outage classification applied:
  - **Network Outage** → Primary + ICMP fail  
  - **Service Outage** → Primary fail, ICMP succeed  
  - **Mixed Outage** → Inconsistent results over multiple checks  
  - **Unknown** → Errors/timeout in fallback  
- Jitter & concurrency respected  
- Original error messages preserved  

### Performance
- <1s overhead on failed probes  
- No extra cost on successful probes  
- +20B memory per endpoint for fallback tracking  
- ~30% DB storage increase for failed probe records  

### UX
- Dashboard shows color-coded outage types  
- Endpoint details: "Last seen via ICMP" timestamps  
- History charts distinguish outage types  
- CSV exports include new fields  

---


# 🔥 Outage Classification Decision Logic

## 🌐 1. Primary Classification (Immediate Fallback)

### For TCP/HTTP Probe Failures
TCP/HTTP Probe Fails
└── Execute ICMP Fallback
├── ICMP Succeeds → Service (2)
├── ICMP Fails → Network (1)
└── ICMP Timeout/Error → Unknown (0)

### For ICMP Probe Failures
ICMP Probe Fails
└── No fallback needed → Network (1)

### For Successful Probes
Probe Succeeds
├── RTT > Performance Threshold → Performance (4)
└── RTT Normal → No Classification

---

## ⚙️ 2. Advanced Classification (Historical / Contextual Analysis)

These rules are applied **after primary classification**, and may **override** the immediate result.

### 🟡 Intermittent (3)
- **Trigger**: ≥4 UP/DOWN transitions in 15 minutes  
- **Logic**: Analyze `CheckResultRaw` history  
- **Override**: Reclassify `Network`/`Service` → `Intermittent`  

---

### 🟠 PartialService (5) *(HTTP only)*
- **Trigger**: HTTP 5xx errors + TCP succeeds  
- **Logic**: Parse HTTP error codes from primary failure  
- **Classification**: `PartialService`  

---

### 🔵 DnsResolution (6)
- **Trigger**: Hostname probe fails, IP probe succeeds  
- **Logic**: Compare DNS resolution with fallback reachability  
- **Classification**: `DnsResolution`  

---

### 🟣 Congestion (7)
- **Trigger**: RTT increase >50% across multiple endpoints simultaneously  
- **Logic**: Cross-endpoint RTT correlation  
- **Classification**: `Congestion`  

---

### 🟢 Maintenance (8)
- **Trigger**: Outage overlaps with maintenance window  
- **Logic**: Check YAML `maintenance` schedule  
- **Classification**: `Maintenance`  

---

## 📌 3. Classification Precedence

When multiple conditions apply, the following precedence is used:

1. **Maintenance (8)** – Highest priority  
2. **DnsResolution (6)** / **PartialService (5)** – Specific service-layer issues  
3. **Intermittent (3)** – Overrides unstable host classifications  
4. **Congestion (7)** – Correlated cross-host slowdown  
5. **Primary Classification (0, 1, 2, 4)** – Default result  

---

## 🗺️ 4. Mermaid Flowchart

```mermaid
flowchart TD
    A[Probe Result] -->|TCP/HTTP Fail| B[Run ICMP Fallback]
    A -->|ICMP Fail| N[Network (1)]
    A -->|Success| S[Check RTT]

    B -->|ICMP Success| Svc[Service (2)]
    B -->|ICMP Fail| Net[Network (1)]
    B -->|ICMP Timeout/Error| Unk[Unknown (0)]

    S -->|RTT > Threshold| Perf[Performance (4)]
    S -->|RTT Normal| NoClass[No Classification]

    %% Advanced Overrides
    subgraph Advanced
        I[Intermittent (3)]
        P[PartialService (5)]
        D[DnsResolution (6)]
        C[Congestion (7)]
        M[Maintenance (8)]
    end

    Net --> I
    Svc --> I
    A --> P
    A --> D
    A --> C
    A --> M