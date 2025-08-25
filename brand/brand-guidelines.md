# ThingConnect Pulse - Brand Guidelines

This directory contains brand assets, guidelines, and specifications for ThingConnect Pulse.

## Brand Identity

### Product Name
**ThingConnect Pulse** - Network availability monitoring for manufacturing sites

**Tagline**: "Keeping your network heartbeat strong"

### Brand Positioning
- **Industrial-grade reliability** for manufacturing environments
- **Simple deployment** without complex infrastructure
- **Local-first monitoring** with privacy by design
- **Manufacturing-focused** features and terminology

## Visual Identity

### Color Palette

**Primary Colors**:
- **Pulse Blue**: `#2196F3` (RGB: 33, 150, 243)
- **Signal Green**: `#4CAF50` (RGB: 76, 175, 80)
- **Alert Red**: `#F44336` (RGB: 244, 67, 54)

**Secondary Colors**:
- **Warning Orange**: `#FF9800` (RGB: 255, 152, 0)
- **Background Gray**: `#F5F5F5` (RGB: 245, 245, 245)
- **Text Dark**: `#212121` (RGB: 33, 33, 33)
- **Text Light**: `#757575` (RGB: 117, 117, 117)

**Status Colors**:
- **UP/Healthy**: `#4CAF50` (Signal Green)
- **DOWN/Critical**: `#F44336` (Alert Red)
- **WARNING**: `#FF9800` (Warning Orange)
- **UNKNOWN**: `#9E9E9E` (Gray)

### Typography

**Primary Font**: Roboto (system fallback: Segoe UI, Arial, sans-serif)
- **Headings**: Roboto Medium (500)
- **Body Text**: Roboto Regular (400)
- **Data/Code**: Roboto Mono (monospace)

**Font Sizes**:
- **H1 (Page Title)**: 24px
- **H2 (Section)**: 20px
- **H3 (Subsection)**: 16px
- **Body**: 14px
- **Caption**: 12px
- **Code**: 13px (monospace)

### Logo Specifications

**Logo Elements**:
- **Icon**: Heartbeat/pulse wave symbol
- **Wordmark**: "ThingConnect Pulse"
- **Combination**: Icon + wordmark

**Usage Rules**:
- Minimum size: 120px width for combination logo
- Clear space: 0.5x logo height on all sides
- Do not modify colors, proportions, or arrangement
- Do not add effects, shadows, or outlines

## UI/UX Guidelines

### Dashboard Design Principles

**Manufacturing-Focused UX**:
- **High contrast** for industrial monitor visibility
- **Large clickable areas** for touch screen compatibility
- **Clear status indicators** visible from a distance
- **Minimal cognitive load** for operators

**Information Hierarchy**:
1. **System status** (overall health at a glance)
2. **Critical alerts** (immediate attention required)
3. **Trending data** (performance over time)
4. **Detailed diagnostics** (for troubleshooting)

### Status Visualization

**Status Indicators**:
- **Filled circles** for current status
- **Trend arrows** for status changes
- **Numeric badges** for counts (outages, alerts)
- **Color-coded backgrounds** for severity levels

**Chart Guidelines**:
- **Line charts** for time series data
- **Uptime percentage** as horizontal bars
- **Response time** as area charts
- **Outage events** as vertical markers

## Application Branding

### Window Titles
- **Main Application**: "ThingConnect Pulse"
- **Configuration**: "ThingConnect Pulse - Configuration"
- **About Dialog**: "About ThingConnect Pulse"

### Service Names
- **Windows Service**: "ThingConnect Pulse Service"
- **Display Name**: "ThingConnect Pulse Network Monitoring"
- **Description**: "Monitors network availability for manufacturing sites"

### File Names & Paths
- **Executable**: `ThingConnect.Pulse.Server.exe`
- **Service**: `ThingConnect.Pulse.Service.exe`
- **Installer**: `ThingConnect.Pulse.Setup.exe`
- **Data Directory**: `%ProgramData%\ThingConnect.Pulse\`

## Messaging & Communication

### Voice & Tone

**Professional but approachable**:
- Use manufacturing-specific terminology when relevant
- Prefer clear, direct language over marketing speak
- Focus on reliability and operational benefits
- Avoid overly technical jargon in user-facing content

**Example Messaging**:
- ✅ "Monitor your network's heartbeat"
- ✅ "Keep production systems connected"
- ❌ "Leverage synergistic monitoring solutions"
- ❌ "Revolutionary network visibility platform"

### Error Messages

**Error Message Guidelines**:
- **Clear cause**: What went wrong?
- **Impact**: What does this mean?
- **Action**: What should the user do?
- **Tone**: Helpful, not alarming

**Examples**:
```
❌ "Connection failed"
✅ "Cannot reach database server (192.168.1.100). Check network connection and try again."

❌ "Invalid configuration"  
✅ "Missing required field 'host' in endpoint configuration. Please add a valid hostname or IP address."
```

## Marketing Materials

### Product Descriptions

**Short Description** (1 line):
"Network availability monitoring for manufacturing sites"

**Medium Description** (elevator pitch):
"ThingConnect Pulse monitors the heartbeat of your manufacturing network, providing real-time visibility into system availability with simple deployment and privacy-first design."

**Long Description** (website/brochure):
"ThingConnect Pulse is purpose-built for manufacturing environments that need reliable network monitoring without complex infrastructure. Deploy locally, monitor everything from production servers to network equipment, and maintain complete control over your data. Built for manufacturing, engineered for simplicity."

### Feature Benefits

**Core Value Propositions**:
- **"Works out of the box"** - Minimal setup, maximum monitoring
- **"Your data stays local"** - Complete privacy and control
- **"Built for manufacturing"** - Industrial-grade reliability
- **"Monitor everything"** - Servers, networks, applications

### Target Audience Messaging

**IT Managers**:
- Reduce monitoring complexity and costs
- Maintain complete control over sensitive data
- Simple deployment and maintenance

**Manufacturing Engineers**:
- Ensure production system availability
- Quick identification of network issues
- Minimal disruption to operations

**System Integrators**:
- Easy integration with existing infrastructure
- Flexible configuration options
- Standard protocols and formats

## Brand Assets Inventory

### Required Assets (To Be Created)
- [ ] Logo (SVG, PNG variants)
- [ ] Icon set (status indicators, navigation)
- [ ] Favicon (16x16, 32x32, 64x64)
- [ ] Windows application icon (.ico)
- [ ] Installer graphics (header, banner)
- [ ] Documentation headers/footers

### Asset Specifications

**Logo Formats Needed**:
- `logo-horizontal.svg` - Primary horizontal layout
- `logo-stacked.svg` - Stacked layout for square spaces  
- `logo-icon-only.svg` - Icon without text
- `logo-monochrome.svg` - Single color version
- PNG exports at 1x, 2x, 3x for each variant

**Icon Requirements**:
- Status icons (up, down, warning, unknown)
- Navigation icons (dashboard, settings, history)
- Action icons (export, refresh, configure)
- File type icons (YAML, CSV, database)

## Usage Guidelines

### Acceptable Use
- Official ThingConnect product documentation
- User interface elements and branding
- Marketing materials and presentations
- Partner/integrator materials (with permission)

### Prohibited Use
- Modification of logo or brand elements
- Use in competing products or services
- Endorsement of third-party products
- Use that implies official partnership (without agreement)

### Brand Approval Process
All marketing materials, documentation, and public-facing content should maintain consistent brand presentation. For questions about brand usage or to request new brand assets, contact the ThingConnect development team.

## Implementation Checklist

**Development Integration**:
- [ ] Application window titles use correct naming
- [ ] Error messages follow tone guidelines
- [ ] Status colors match brand palette
- [ ] Typography uses specified font stack
- [ ] Icon usage consistent throughout UI

**Documentation Branding**:
- [ ] Headers/footers include brand elements
- [ ] Color palette used in diagrams and charts
- [ ] Consistent terminology across all docs
- [ ] About pages include proper brand messaging

**Marketing Materials**:
- [ ] Website content uses approved messaging
- [ ] Product descriptions match brand voice
- [ ] Screenshots show consistent UI branding
- [ ] All materials use correct logo variants

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-25  
**Next Review**: 2025-11-25  
**Owner**: ThingConnect Development Team