# ThingConnect Pulse - Security Baseline

This document defines the security posture, network binding policy, and security guidelines for ThingConnect Pulse v1.

## Security Posture Overview

ThingConnect Pulse v1 is designed for **trusted LAN environments** in manufacturing/industrial settings with the following security principles:

- **Localhost + LAN binding only** - No internet exposure
- **HTTP-only protocol** - HTTPS via reverse proxy if needed
- **No authentication** - Assumes trusted network perimeter
- **Local System service** - Minimal Windows privileges
- **Data at rest protection** - File system permissions

## Network Binding Policy

### Default Configuration
- **Default Port**: `8080`
- **Binding Address**: 
  - **Development**: `localhost:8080` (local access only)
  - **Production**: `0.0.0.0:8080` (all interfaces for LAN access)
- **Protocol**: HTTP only (no TLS/SSL in v1)

### Rationale
- **Port 8080**: Standard non-privileged HTTP port, unlikely to conflict
- **HTTP-only**: Simplifies deployment, assumes network-level security
- **LAN binding**: Enables monitoring dashboards on local network
- **No authentication**: Reduces complexity for manufacturing environments

### Network Architecture Assumptions
ThingConnect Pulse assumes deployment in:
- **Isolated manufacturing networks** (air-gapped or firewalled)
- **Trusted operator environments** (physical access control)
- **Behind network firewalls** (no direct internet exposure)
- **Single-site installations** (not multi-tenant)

## Configuration Options

### Binding Configuration
The following configuration options control network binding:

```json
// appsettings.json - Development
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:8080"
      }
    }
  }
}
```

```json
// appsettings.Production.json - Production
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:8080"
      }
    }
  }
}
```

### Environment Variables
Override defaults with environment variables:
- `ASPNETCORE_URLS=http://localhost:8080` - Custom binding
- `PULSE_BIND_ADDRESS=192.168.1.100` - Specific interface binding
- `PULSE_PORT=8080` - Custom port

### Command Line Options
```bash
# Bind to specific address
ThingConnect.Pulse.Server.exe --urls "http://192.168.1.100:8080"

# Bind to all interfaces
ThingConnect.Pulse.Server.exe --urls "http://0.0.0.0:8080"

# Custom port
ThingConnect.Pulse.Server.exe --urls "http://localhost:9000"
```

## Security Controls

### Access Control
- **No application-level authentication** in v1
- **Network perimeter security** assumed (firewalls, VLANs)
- **Physical security** assumed (locked server rooms)
- **OS-level permissions** protect data files

### Data Protection
- **Database encryption**: Not implemented in v1 (SQLite file-level)
- **Configuration files**: Protected by Windows file system ACLs
- **Log files**: May contain IP addresses, no credentials logged
- **Memory**: No sensitive data in memory (passwords, keys)

### Service Security
- **Service account**: Local System (standard for system services)
- **File permissions**: 
  - `%ProgramFiles%\ThingConnect.Pulse\`: Read-only for users
  - `%ProgramData%\ThingConnect.Pulse\`: Full control for Local System
- **Registry**: Minimal usage (service registration only)
- **Network permissions**: Outbound probing (ICMP, TCP, HTTP)

## Security Limitations (v1)

### Known Limitations
- **No TLS/HTTPS**: HTTP plaintext only
- **No authentication**: Open access on network
- **No authorization**: All users have full access
- **No audit logging**: Basic operational logs only
- **No input validation**: Assumes trusted configuration
- **No rate limiting**: Potential DoS vulnerability

### Mitigation Strategies
- **Network segmentation**: Deploy on isolated VLANs
- **Firewall rules**: Block external access to port 8080
- **Reverse proxy**: Use nginx/IIS for HTTPS termination
- **Physical security**: Secure server room access
- **Monitoring**: Network monitoring for anomalous access

## Compliance Considerations

### Manufacturing Standards
- **IEC 62443**: Industrial cybersecurity - Level 1 (basic protection)
- **NIST Framework**: Identify, Protect (network controls)
- **ISO 27001**: Information security baseline

### Data Privacy
- **No PII collection**: Only technical network data
- **IP address logging**: Operational necessity for monitoring
- **Local data storage**: No cloud transmission
- **Data retention**: 60-day default (configurable)

## Security Roadmap (Future Versions)

### v1.1 Enhancements
- **TLS/HTTPS support**: Optional SSL certificate configuration
- **Basic authentication**: Optional username/password protection
- **Audit logging**: Security event log integration
- **Configuration validation**: Input sanitization

### v2.0 Features
- **Role-based access**: Read-only vs administrative users
- **Active Directory integration**: Windows authentication
- **API keys**: Programmatic access control
- **Security headers**: OWASP best practices

## Deployment Security Checklist

### Pre-Deployment
- [ ] Verify network isolation (no internet routes)
- [ ] Configure firewall rules (block external port 8080)
- [ ] Review IP address ranges for monitoring
- [ ] Confirm physical server security

### Post-Deployment  
- [ ] Test LAN accessibility from intended clients
- [ ] Verify localhost-only access in development
- [ ] Confirm service runs with minimal privileges
- [ ] Monitor logs for unauthorized access attempts

### Maintenance
- [ ] Regular security updates for Windows/.NET
- [ ] Periodic network security assessments
- [ ] Configuration backup and recovery testing
- [ ] Log file retention and rotation

## Incident Response

### Security Events
- **Unauthorized network access**: Review firewall logs
- **Service account compromise**: Reset Local System permissions
- **Configuration tampering**: Restore from version history
- **Database corruption**: Recover from backup

### Contact Information
- **Internal IT Security**: [Organization-specific]
- **ThingConnect Support**: [To be defined]
- **Windows Security Updates**: Microsoft Security Response Center

## References

- [ASP.NET Core Security Best Practices](https://docs.microsoft.com/en-us/aspnet/core/security/)
- [Windows Service Security](https://docs.microsoft.com/en-us/windows/win32/services/service-security-and-access-rights)
- [Industrial Network Security Guidelines](https://www.cisa.gov/industrial-control-systems-security)

---

**Document Version**: 1.0  
**Last Updated**: 2024-08-25  
**Next Review**: 2024-11-25  
**Owner**: ThingConnect Development Team