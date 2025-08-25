# ThingConnect Pulse — Target Users & Jobs-to-Be-Done

## Primary User Personas

### 1. **Plant IT/OT Administrator** ("Systems Admin Sarah")

**Profile:**
- **Role**: Network/systems administrator for manufacturing facility
- **Experience**: 5-15 years in industrial IT, familiar with Windows Server, networking equipment
- **Responsibilities**: Network infrastructure, device configuration, system maintenance, compliance reporting
- **Pain Points**: Limited budget, complex enterprise tools, manual device management, audit requirements
- **Technical Comfort**: High — comfortable with YAML, command line, network diagnostics

**Motivations:**
- Maintain uptime and visibility across all networked devices
- Reduce manual monitoring tasks and automate reporting
- Ensure compliance with corporate IT policies
- Stay within budget constraints while expanding monitoring coverage

**Success Metrics:**
- Network issues detected before production impact
- Reduced time spent on manual device inventory
- Compliance reports generated efficiently
- Zero monitoring tool licensing costs

### 2. **Production Supervisor** ("Operations Mike")

**Profile:**
- **Role**: Shift supervisor overseeing manufacturing operations
- **Experience**: 10-20 years in manufacturing, strong operational focus
- **Responsibilities**: Production targets, equipment uptime, shift handoffs, problem escalation
- **Pain Points**: Lack of real-time visibility, reactive problem-solving, incomplete handoff information
- **Technical Comfort**: Medium — comfortable with tablets/phones, prefers simple interfaces

**Motivations:**
- Quick visibility into overall system health before/during/after shifts
- Early warning of issues that might impact production
- Clear information for shift handoff communication
- Mobile-friendly access for floor-based work

**Success Metrics:**
- Fast "all green" status confirmation at shift start
- Proactive issue identification before production impact
- Clear historical context for troubleshooting discussions
- Mobile accessibility from production floor

### 3. **Maintenance/Controls Engineer** ("Troubleshooter Tom")

**Profile:**
- **Role**: Industrial maintenance technician or controls engineer
- **Experience**: 8-25 years in equipment maintenance, automation systems
- **Responsibilities**: Equipment repair, preventive maintenance, root cause analysis, system optimization
- **Pain Points**: Lack of historical data for troubleshooting, reactive maintenance, difficult correlation between network and production issues
- **Technical Comfort**: High — familiar with PLCs, HMIs, network diagnostics, data analysis

**Motivations:**
- Historical data to support root cause analysis
- Correlation between network issues and production problems
- Predictive indicators for preventive maintenance
- Real-time status during equipment commissioning

**Success Metrics:**
- Network outage history available for incident correlation
- Performance trends indicating degradation before failure
- Real-time monitoring during system troubleshooting
- Export capabilities for maintenance documentation

## Jobs-to-Be-Done Analysis

### Primary Jobs (Core Workflows)

| **Persona** | **Job-to-Be-Done** | **Desired Outcome** | **API/UX Touchpoints** |
|-------------|-------------------|-------------------|------------------------|
| **Systems Admin Sarah** | Set up monitoring for new equipment/subnet | All new devices monitored within 5 minutes | YAML config editor, CIDR/wildcard expansion, Apply workflow |
| **Systems Admin Sarah** | Generate compliance report for audit | Historical availability data exported as CSV in required format | History view, CSV export, date range selection |
| **Systems Admin Sarah** | Troubleshoot network connectivity issue | Identify which devices are affected and when problems started | Live dashboard, endpoint detail, outage timeline |
| **Operations Mike** | Check system health at shift start | Confident "all systems operational" or immediate problem awareness | Live board mobile view, status overview, recent changes |
| **Operations Mike** | Hand off issues to next shift | Clear communication about ongoing problems and context | Outage list, status history, mobile-friendly export |
| **Operations Mike** | Investigate production line slowdown | Correlate network issues with production timeline | Historical view, outage correlation, RTT trends |
| **Troubleshooter Tom** | Analyze recurring equipment failures | Historical pattern analysis and correlation with network events | Endpoint detail page, outage history, RTT performance charts |
| **Troubleshooter Tom** | Commission new automation equipment | Real-time confirmation of network connectivity during setup | Live dashboard, immediate status updates, ping/connectivity tests |
| **Troubleshooter Tom** | Document maintenance findings | Network performance data to include in maintenance reports | CSV export, endpoint-specific history, performance metrics |

### Secondary Jobs (Supporting Workflows)

| **Persona** | **Job-to-Be-Done** | **Desired Outcome** | **API/UX Touchpoints** |
|-------------|-------------------|-------------------|------------------------|
| **Systems Admin Sarah** | Recover from configuration mistake | Roll back to previous working configuration quickly | Config versions, restore workflow, diff preview |
| **Systems Admin Sarah** | Onboard new team member | Transfer monitoring knowledge and access efficiently | Documentation links, config version history, sample configurations |
| **Operations Mike** | Communicate with IT about network issues | Provide specific technical details without requiring deep expertise | Status screenshots, outage summaries, simple export options |
| **Troubleshooter Tom** | Validate network improvements | Measure performance before/after equipment changes | Historical comparison views, RTT trend analysis, availability metrics |

## User Journey Mapping

### **Journey 1: First-Time Setup** (Systems Admin Sarah)
1. **Trigger**: New monitoring requirement from management
2. **Discovery**: Download ThingConnect Pulse installer
3. **Installation**: Run installer, Windows Service created automatically
4. **Configuration**: Edit YAML config with subnet ranges and device IPs
5. **Validation**: Press Apply, review diff preview, confirm changes
6. **Verification**: Watch live dashboard populate with device status
7. **Success**: All critical devices showing UP status within 5 minutes

**Critical UX Requirements:**
- Clear YAML schema documentation and examples
- Real-time feedback during Apply process
- Immediate visual confirmation of monitoring status

### **Journey 2: Daily Operations Check** (Operations Mike)
1. **Trigger**: Start of production shift
2. **Access**: Open Pulse dashboard on tablet/phone
3. **Overview**: Scan live board for any red/warning indicators
4. **Investigation**: Drill into any problem devices for context
5. **Documentation**: Screenshot or note issues for shift handoff
6. **Escalation**: Contact IT if critical systems affected
7. **Success**: Confident handoff to next shift with complete visibility

**Critical UX Requirements:**
- Mobile-optimized live dashboard
- Clear visual hierarchy (green/red status)
- Quick drill-down to problem details
- Easy screenshot/export for communication

### **Journey 3: Root Cause Analysis** (Troubleshooter Tom)
1. **Trigger**: Production incident requiring investigation
2. **Context**: Identify time range when problem occurred
3. **Correlation**: Review network outages during incident timeframe
4. **Analysis**: Examine RTT trends and connectivity patterns
5. **Documentation**: Export relevant data for incident report
6. **Follow-up**: Set up additional monitoring for related equipment
7. **Success**: Network contribution to incident clearly identified

**Critical UX Requirements:**
- Flexible date/time range selection
- Clear correlation between network and timeline events
- CSV export with relevant technical details
- Historical trend visualization

## Prioritization Framework

### **P1 (Must Have for v1)**
- Live dashboard with mobile responsiveness
- YAML configuration with Apply workflow
- Basic outage detection and history
- CSV export for compliance reporting

### **P2 (Important for Adoption)**
- Endpoint detail pages with performance charts
- Configuration version management
- Advanced filtering and search
- RTT trend analysis

### **P3 (Enhancement for Power Users)**
- Custom reporting templates
- Advanced correlation features
- Performance benchmarking tools
- Integration hooks for external systems

## Success Metrics by Persona

### **Systems Admin Sarah**
- Configuration changes completed in <5 minutes
- Zero monitoring licensing costs achieved
- Compliance reports generated without manual data collection
- Network issues detected before user complaints

### **Operations Mike**
- Daily shift status check completed in <30 seconds
- Production incidents correlated with network data
- Mobile dashboard used regularly for floor-based monitoring
- Clear handoff communication improved

### **Troubleshooter Tom**
- Historical network data available for all incident investigations
- Maintenance documentation includes network performance metrics
- Preventive maintenance triggered by network performance trends
- Root cause analysis time reduced through better data access

---

*This persona framework ensures ThingConnect Pulse delivers specific value to each user type while maintaining simplicity and ease of adoption across manufacturing environments.*