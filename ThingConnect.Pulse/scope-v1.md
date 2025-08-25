# ThingConnect Pulse v1.0 — Scope & Non-Goals

## Release Objective

Deliver a **production-ready, free network availability monitoring solution** for manufacturing sites that can be installed and operational within 5 minutes, with zero external dependencies and unlimited endpoint monitoring capability.

## In Scope (v1.0 Must-Have)

### **Core Monitoring**
- ✅ **Availability monitoring only** — UP/DOWN status detection
- ✅ **Probe types**: ICMP ping, TCP port checks, HTTP/HTTPS requests with content matching
- ✅ **IPv4 and IPv6 support** — dual-stack networking
- ✅ **Configurable intervals** — per-endpoint probe frequency (default 10 seconds)
- ✅ **Timeout and retry logic** — configurable per probe type
- ✅ **Flap damping** — 2/2 logic (2 failures → DOWN, 2 successes → UP)
- ✅ **RTT measurement** — where naturally available (ICMP echo time, TCP connect time, HTTP response time)

### **Configuration Management**
- ✅ **YAML-based configuration** — single file with JSON Schema validation
- ✅ **Explicit Apply workflow** — configuration changes require user confirmation
- ✅ **Configuration versioning** — automatic snapshots with restore capability
- ✅ **Bulk device discovery** — CIDR range expansion (`10.0.0.0/24`), wildcard expansion (`192.168.1.*`)
- ✅ **Groups and organization** — hierarchical endpoint grouping
- ✅ **Diff preview** — show configuration changes before Apply

### **Data Storage & Management**
- ✅ **SQLite embedded database** — zero-configuration storage
- ✅ **PostgreSQL support** — provider-switching for scale scenarios
- ✅ **Raw check results** — all probe attempts stored with timestamps
- ✅ **15-minute rollups** — aggregated availability percentages and RTT averages
- ✅ **Daily rollups** — long-term availability summaries
- ✅ **Outage detection** — automatic start/end timestamp tracking
- ✅ **Data retention policies** — 60-day raw data, indefinite rollups
- ✅ **Watermark-based processing** — efficient streaming aggregation

### **User Interface**
- ✅ **Live dashboard** — real-time status board with mobile responsiveness
- ✅ **Endpoint detail pages** — individual device history and configuration
- ✅ **Historical views** — availability charts and outage timelines
- ✅ **Search and filtering** — by group, name, status, or host
- ✅ **Status indicators** — clear UP/DOWN/FLAPPING visual states
- ✅ **15-minute sparklines** — quick visual status trends
- ✅ **Mobile-friendly interface** — tablet and phone support for shift supervisors

### **Data Export & Reporting**
- ✅ **CSV export** — raw data, rollups, and outages with flexible date ranges
- ✅ **Compliance reporting** — audit-ready data extraction
- ✅ **Header metadata** — generation timestamp and app version in exports

### **Deployment & Operations**
- ✅ **Windows Service installation** — professional Inno Setup installer
- ✅ **Single executable deployment** — embedded dependencies
- ✅ **Automatic service startup** — runs at boot without user login
- ✅ **Local-only operation** — no internet connectivity required
- ✅ **Standard directory structure** — Program Files + ProgramData separation
- ✅ **Structured logging** — Serilog with daily rotation and Windows Event Log integration
- ✅ **Manual update checking** — GitHub API integration for version notifications

### **API & Integration**
- ✅ **REST API** — complete programmatic access to all functionality
- ✅ **OpenAPI specification** — documented and contract-tested endpoints
- ✅ **Configuration API** — Apply, list, and download configuration versions
- ✅ **Live data API** — current status and recent history
- ✅ **Historical data API** — flexible date ranges and aggregation levels
- ✅ **Export API** — CSV streaming for external integrations

## Out of Scope (v1.0 Explicit Non-Goals)

### **Security & Authentication**
- ❌ **TLS/HTTPS termination** — HTTP-only deployment for v1
- ❌ **User authentication UI** — trusted LAN deployment model
- ❌ **Role-based access control** — single administrative interface
- ❌ **External authentication** — no Active Directory, LDAP, or SSO integration
- ❌ **API authentication** — no API keys or token-based access

### **Network & Deployment**
- ❌ **WAN/internet exposure** — internal network only
- ❌ **Reverse proxy configuration** — direct service access only
- ❌ **Cloud deployment** — Windows on-premises only
- ❌ **Linux support** — Windows-first deployment strategy
- ❌ **Container/Docker packaging** — Windows Service native deployment
- ❌ **Clustering/high availability** — single-node deployment

### **Advanced Monitoring**
- ❌ **Performance metrics beyond RTT** — no CPU, memory, disk, or throughput monitoring
- ❌ **SNMP polling** — network availability only, not device performance
- ❌ **Application layer monitoring** — no deep protocol inspection
- ❌ **Custom metrics collection** — availability-focused scope
- ❌ **Synthetic transactions** — basic HTTP content matching only
- ❌ **Network topology discovery** — explicit configuration required

### **Alerting & Notifications**
- ❌ **Email notifications** — status change detection only
- ❌ **SMS/text messaging** — no external service integrations
- ❌ **Webhooks for alerts** — API available but no built-in delivery
- ❌ **Integration with ticketing systems** — external integration responsibility
- ❌ **Escalation policies** — notification logic deferred
- ❌ **Quiet hours/maintenance windows** — always-on monitoring

### **User Experience & Localization**
- ❌ **Multi-language support** — English-only interface
- ❌ **Custom dashboards** — single live board view
- ❌ **User preferences** — global settings only
- ❌ **Advanced visualization** — basic charts and sparklines only
- ❌ **Custom reporting templates** — CSV export only

### **Advanced Configuration**
- ❌ **GUI-based configuration editor** — YAML file editing required
- ❌ **Configuration templates** — manual YAML creation
- ❌ **Auto-discovery of devices** — explicit configuration required
- ❌ **Configuration inheritance** — flat endpoint configuration
- ❌ **Conditional monitoring rules** — static configuration only

### **Data & Analytics**
- ❌ **Advanced analytics** — basic availability percentages only
- ❌ **Predictive analysis** — historical data only
- ❌ **Anomaly detection** — threshold-based monitoring only
- ❌ **Data federation** — single-site deployment
- ❌ **External data sources** — internal monitoring only

## Release Guardrails

### **Performance Requirements**
- **Scale target**: 1,000 endpoints @ 10-second intervals
- **Resource limits**: <2% CPU, <200MB RAM on modest Windows Server
- **Database performance**: SQLite sustained 10-50 writes/second
- **UI responsiveness**: Live dashboard updates <1 second latency
- **Installation time**: Complete setup in ≤5 minutes

### **Quality Gates**
- **Zero licensing costs** — completely free deployment
- **No internet dependencies** — functional in air-gapped environments
- **Mobile responsiveness** — dashboard usable on tablets and phones
- **Configuration validation** — schema errors prevented before Apply
- **Data integrity** — no data loss during service restarts
- **Upgrade safety** — configuration and data preserved across updates

### **Operational Requirements**
- **Windows Service reliability** — automatic restart on failure
- **Log rotation** — prevent disk space issues in production
- **Configuration backup** — automatic version snapshots
- **Database migration safety** — backward compatibility for updates
- **Installation/uninstallation** — clean registry and file system management

## Feature Flags & Configuration Limits

### **Built-in Safeguards**
```yaml
# Default limits to prevent resource exhaustion
discovery:
  max_cidr_expansion: 1000        # Maximum endpoints per CIDR range
  max_wildcard_expansion: 254     # Maximum endpoints per wildcard
  expansion_throttle_ms: 100      # Delay between endpoint expansions

monitoring:
  max_concurrent_probes: 100      # Concurrent probe execution limit
  min_probe_interval_s: 5         # Minimum allowed probe frequency
  max_probe_timeout_ms: 10000     # Maximum timeout per probe

data_retention:
  raw_data_days: 60               # Automatic pruning of raw check results
  rollup_retention_days: -1       # Keep rollups indefinitely (-1 = no limit)
  log_retention_days: 30          # Application log rotation
```

### **v1.x Evolution Path**
These non-goals represent **deferral, not permanent exclusion**. Future versions may include:
- **v1.1**: TLS support and basic authentication
- **v1.2**: Email/webhook alerting with maintenance windows  
- **v1.3**: SNMP polling and expanded protocol support
- **v2.0**: Multi-site federation and advanced analytics

## Scope Enforcement

### **Pull Request Guidelines**
Any feature additions must:
1. **Reference this scope document** for justification or deferral
2. **Maintain performance requirements** within specified limits
3. **Preserve zero-dependency deployment** model
4. **Not introduce security surface area** beyond HTTP API
5. **Include appropriate feature flags** for optional functionality

### **Issue Triage Rules**
- **In-scope issues**: Label as `priority:P1` or `priority:P2` based on core vs. enhancement
- **Out-of-scope issues**: Label as `scope:v1.x` and defer to future releases
- **Scope questions**: Reference specific section of this document in issue comments

### **Release Readiness Checklist**
- [ ] All "In Scope" features implemented and tested
- [ ] Performance requirements validated under load
- [ ] Installation process tested on clean Windows systems
- [ ] Configuration examples and documentation complete
- [ ] No "Out of Scope" features accidentally included
- [ ] Feature flags configured with appropriate defaults

---

## Summary

ThingConnect Pulse v1.0 delivers a **complete, production-ready network availability monitoring solution** focused on manufacturing environments. The scope prioritizes **simplicity, reliability, and zero-dependency deployment** over advanced features that can be added in subsequent releases.

**Core principle**: *Better to ship a focused, excellent v1.0 than an overloaded, delayed initial release.*

This scope document serves as the **definitive reference** for all development decisions and should be consulted before accepting any feature requests or scope expansions.