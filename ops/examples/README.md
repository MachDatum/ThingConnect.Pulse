# Example Files

This directory contains example files for ThingConnect Pulse operations and configuration.

## Update Check JSON Examples

### updates.json
Standard update check response showing an available update from version 1.0.0 to 1.2.1.

**Usage**: Host this file on a web server and configure ThingConnect Pulse to check this URL for updates.

### updates-beta.json  
Beta channel update check response showing a pre-release version (1.3.0-beta.2) available.

**Usage**: Used for testing beta releases and pre-release update notifications.

### updates-no-update.json
Response when no update is available (current version matches latest version).

**Usage**: Shows the expected format when the system is up-to-date.

## Update Check JSON Contract

All update check JSON files must follow this structure:

```json
{
  "current": "1.0.0",           // Current installed version (SemVer)
  "latest": "1.2.1",            // Latest available version (SemVer)  
  "notes_url": "https://..."    // URL to release notes/changelog
}
```

### Field Requirements

- **current**: Must be a valid semantic version (MAJOR.MINOR.PATCH)
- **latest**: Must be a valid semantic version, may include pre-release identifiers  
- **notes_url**: Must be a valid HTTP/HTTPS URL pointing to release documentation

### Hosting Recommendations

1. **GitHub Pages**: Host in `gh-pages` branch for automatic updates
2. **CDN**: Use CloudFlare or AWS CloudFront for global distribution
3. **Static Site**: Deploy to Netlify, Vercel, or similar services
4. **Enterprise**: Internal web servers for air-gapped environments

### Automation

Consider automating the update of these JSON files when new releases are published:

```yaml
# GitHub Actions example
- name: Update JSON files
  run: |
    echo '{"current":"${{ env.PREVIOUS_VERSION }}","latest":"${{ env.NEW_VERSION }}","notes_url":"${{ env.RELEASE_URL }}"}' > updates.json
```