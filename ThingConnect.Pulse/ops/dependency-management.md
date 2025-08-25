# Dependency Management Policy

This document defines the automated dependency update policy, merge procedures, and security practices for ThingConnect Pulse dependency management using Dependabot.

## Overview

ThingConnect Pulse uses GitHub Dependabot to automate dependency updates across three package ecosystems:
- **.NET NuGet packages** (backend)
- **npm packages** (frontend) 
- **GitHub Actions** (CI/CD)

Updates are automatically created as pull requests on a weekly schedule with appropriate grouping, labeling, and review assignments.

## Dependency Update Schedule

### Weekly Update Cycle (Tuesdays)
- **08:00 EST**: GitHub Actions updates
- **09:00 EST**: .NET NuGet packages  
- **10:00 EST**: npm packages

### Update Limits
- **NuGet & npm**: Maximum 5 open PRs per ecosystem
- **GitHub Actions**: Maximum 2 open PRs
- **Total limit**: ~12 concurrent dependency PRs maximum

## Merge Policy

### Automatic Approval Criteria

**✅ Auto-merge candidates** (no manual review required):
- **Patch updates** (x.y.Z) for all packages
- **Minor updates** (x.Y.z) for stable, well-tested packages:
  - Microsoft.* packages (EntityFramework, Extensions, etc.)
  - Serilog.* packages  
  - ESLint, TypeScript, Prettier (build tools)
  - GitHub Actions (setup-*, checkout, etc.)

**⚠️ Manual review required**:
- **Major updates** (X.y.z) - always require manual testing
- **Security patches** - individual PRs, priority review
- **React ecosystem updates** - major versions require testing
- **Breaking change indicators** in PR description

### Review Process

**Standard workflow**:
1. **Dependabot creates PR** with automated CI checks
2. **CI pipeline validates** code quality gates pass
3. **Auto-approval** if criteria met (see above)
4. **Manual review** for complex updates or major versions
5. **Merge** after all checks pass

**Priority workflow** (security updates):
1. **Immediate notification** to maintainers
2. **Priority review** within 24 hours
3. **Emergency merge** process if critical vulnerability

## Package Categories and Grouping

### .NET NuGet Packages

**Microsoft packages** (grouped for efficiency):
- `Microsoft.*` - Framework and library updates
- `System.*` - Core .NET system libraries  
- `Microsoft.EntityFrameworkCore.*` - Database ORM updates

**Serilog packages** (grouped):
- `Serilog.*` - Logging framework and sinks
- Includes Serilog.AspNetCore, Serilog.Sinks.File, etc.

**Individual PRs**:
- Third-party packages (NJsonSchema, YamlDotNet, etc.)
- Major version updates (require individual attention)

### npm Packages (Frontend)

**React ecosystem** (grouped):
- `react*` - Core React libraries
- `@types/react*` - TypeScript definitions

**TypeScript tooling** (grouped):
- `typescript` - TypeScript compiler
- `@types/*` - Type definitions
- `@typescript-eslint/*` - TypeScript ESLint rules

**Build tools** (grouped):
- `vite*` and `@vitejs/*` - Build system
- `eslint*` - Linting tools
- `prettier` - Code formatting

**Chakra UI** (grouped):
- `@chakra-ui/*` - UI component library
- `@emotion/*` - CSS-in-JS dependencies

### GitHub Actions

**Setup actions** (grouped):
- `actions/checkout` - Repository checkout
- `actions/setup-*` - Environment setup (Node.js, .NET, etc.)
- `actions/upload-artifact` - Build artifact handling

## Security Update Handling

### High-Severity Vulnerabilities

**Immediate response** (< 24 hours):
- Critical and high-severity CVEs
- Direct dependencies with active exploits
- Packages with network exposure (HTTP clients, parsers)

**Process**:
1. Dependabot creates individual security PR
2. Automatic Slack/email notification to maintainers
3. Priority review and testing on development branch
4. Emergency merge to main branch if vulnerability confirmed
5. Immediate deployment to production environments

### Medium/Low Severity

**Standard process** (within 1 week):
- Medium-severity vulnerabilities grouped with regular updates
- Low-severity updates follow normal weekly schedule
- Security PRs clearly labeled for tracking

## Ignored Packages and Manual Override

### Permanently Ignored

**NuGet packages**:
- `Microsoft.AspNetCore.SpaProxy` - Locked to .NET 8 compatible versions
- `StyleCop.Analyzers` - Locked to specific beta for .NET 8 support

**npm packages**:
- `react` major versions - Require comprehensive testing
- `react-dom` major versions - Breaking changes need validation

### Manual Override Process

When manual updates are required:

1. **Disable Dependabot** for specific package temporarily:
   ```yaml
   ignore:
     - dependency-name: "package-name"
       update-types: ["version-update:semver-major"]
   ```

2. **Create manual PR** with proper testing and validation
3. **Update Dependabot config** to re-enable automated updates
4. **Document decision** in PR description and dependency-management.md

## Quality Gates Integration

### Required Checks

All dependency update PRs must pass:
- **Backend quality gate**: .NET analyzers, StyleCop, build verification
- **Frontend quality gate**: ESLint, TypeScript compilation, build verification  
- **Security scan**: npm audit, DevSkim analysis (non-blocking warnings)

### Failed Check Resolution

**Build failures**:
- Dependabot automatically rebases and retries
- Manual intervention required for breaking changes
- Close PR and create manual update if incompatible

**Quality gate failures**:
- Address linting/analyzer warnings in separate commits
- Update codebase to accommodate new package requirements
- Consider ignoring specific rules if justified

## Monitoring and Metrics

### Key Metrics to Track

**Update velocity**:
- Time from PR creation to merge
- Percentage of auto-merged vs. manually reviewed
- Security update response time

**Package health**:
- Number of outdated packages  
- Security vulnerability exposure time
- Dependency tree complexity

**CI impact**:
- Build success rate for dependency PRs
- Performance impact of updated packages
- Rollback frequency due to issues

### Monthly Review Process

**Dependency audit**:
1. Review all ignored/pinned packages for update availability
2. Assess major version updates that were deferred
3. Evaluate grouping effectiveness and PR volume
4. Update Dependabot configuration based on lessons learned

**Security posture**:
1. Run comprehensive security scans (`npm audit`, `dotnet list package --vulnerable`)
2. Review and prioritize any remaining vulnerabilities
3. Plan manual updates for complex security patches
4. Update security response procedures if needed

## Troubleshooting Common Issues

### "Dependabot cannot update package.lock"

**Cause**: Version conflicts or corrupted lock files
**Resolution**:
1. Delete `package-lock.json` (npm) or equivalent
2. Run `npm install` locally to regenerate
3. Commit updated lock file  
4. Close Dependabot PR and let it recreate

### "Package update breaks build"

**Cause**: Breaking changes in minor/patch updates
**Resolution**:
1. Identify specific breaking change from package changelog
2. Update code to accommodate new API
3. Consider adding package to ignore list temporarily
4. Create issue to track proper integration

### "Too many dependency PRs open"

**Cause**: Configuration limits too high or merge delays
**Resolution**:
1. Lower `open-pull-requests-limit` in dependabot.yml
2. Increase grouping to reduce individual PRs
3. Improve auto-merge criteria to reduce manual review backlog
4. Schedule dedicated time for dependency PR reviews

### "Security update delayed"

**Cause**: Security PR requires manual review but not prioritized
**Resolution**:
1. Set up security alert notifications (GitHub Security tab)
2. Establish security update SLA (24 hours for high, 1 week for medium)
3. Create security-specific review process with dedicated maintainers
4. Consider emergency merge procedures for critical vulnerabilities

## Configuration Management

### Dependabot Configuration Location
- **File**: `.github/dependabot.yml`  
- **Documentation**: This file (docs/ops/dependency-management.md)
- **Change process**: PR review required, test on development branch first

### Label Management
- **area:deps**: All dependency-related PRs
- **type:maintenance**: Routine maintenance including dependency updates  
- **area:frontend**: Frontend-specific npm updates
- **area:ci**: GitHub Actions updates
- **priority:security**: Security vulnerability fixes

### Reviewer Assignment
- **Primary**: @hemanandr (automatic assignment)
- **Backup**: TBD (add additional maintainers as team grows)
- **Security**: All security PRs assigned to primary maintainer

---

This dependency management policy ensures ThingConnect Pulse maintains up-to-date, secure dependencies while balancing automation efficiency with manual oversight for complex changes.