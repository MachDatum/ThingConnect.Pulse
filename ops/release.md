# ThingConnect Pulse - Release Management

This document defines the complete release process, versioning strategy, and publishing workflow for ThingConnect Pulse.

## Versioning Strategy

### Semantic Versioning (SemVer)
ThingConnect Pulse follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes, incompatible API changes
- **MINOR** (X.Y.0): New features, backward-compatible functionality
- **PATCH** (X.Y.Z): Bug fixes, backward-compatible fixes

### Version Numbering
- **Starting version**: `0.1.0` (pre-release development)
- **First stable**: `1.0.0` (production-ready release)
- **Tag format**: `vX.Y.Z` (e.g., `v0.1.0`, `v1.0.0`)

### Release Channels

#### Beta Channel
- **Purpose**: Pre-release testing, feature validation
- **Versions**: `X.Y.Z-beta.N` (e.g., `v0.2.0-beta.1`)
- **Stability**: Feature-complete but may have bugs
- **Audience**: Early adopters, internal testing

#### Stable Channel  
- **Purpose**: Production deployments
- **Versions**: `X.Y.Z` (e.g., `v1.0.0`)
- **Stability**: Thoroughly tested, production-ready
- **Audience**: General users, production environments

## Version Management

### Project Version Synchronization
All project components must maintain version consistency:

```xml
<!-- Directory.Build.props -->
<Version>0.1.0</Version>
<AssemblyVersion>0.1.0.0</AssemblyVersion>
<FileVersion>0.1.0.0</FileVersion>
```

```json
// thingconnect.pulse.client/package.json
{
  "version": "0.1.0"
}
```

### Version Bump Process

1. **Determine version increment** based on changes:
   - Breaking changes → MAJOR
   - New features → MINOR  
   - Bug fixes → PATCH

2. **Update version numbers** in all project files:
   ```bash
   # Update .NET projects
   # Edit Directory.Build.props - change <Version>X.Y.Z</Version>
   
   # Update frontend
   cd thingconnect.pulse.client
   npm version X.Y.Z --no-git-tag-version
   ```

3. **Update CHANGELOG.md** with release notes
4. **Commit version changes**:
   ```bash
   git add .
   git commit -m "bump: version to X.Y.Z"
   ```

## Release Process

### Pre-Release Checklist

- [ ] All tests passing in CI
- [ ] Code quality checks passed
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with new version
- [ ] Version numbers synchronized across projects
- [ ] Release notes drafted

### Beta Release Process

1. **Create release branch**:
   ```bash
   git checkout -b release/v0.2.0-beta.1
   ```

2. **Update version numbers** to beta version
3. **Update CHANGELOG.md** with beta section
4. **Commit and push**:
   ```bash
   git add .
   git commit -m "release: v0.2.0-beta.1"
   git push origin release/v0.2.0-beta.1
   ```

5. **Create Pull Request** to main branch
6. **After merge, create tag**:
   ```bash
   git checkout main
   git pull origin main
   git tag v0.2.0-beta.1
   git push origin v0.2.0-beta.1
   ```

7. **Publish GitHub Release** (automated by GitHub Actions)

### Stable Release Process

1. **Ensure beta testing complete**
2. **Create release branch**:
   ```bash
   git checkout -b release/v0.2.0
   ```

3. **Update version numbers** to stable version
4. **Finalize CHANGELOG.md** with release date
5. **Build and test final artifacts**
6. **Commit and create PR**:
   ```bash
   git add .
   git commit -m "release: v0.2.0"
   git push origin release/v0.2.0
   # Create PR to main
   ```

7. **After merge, create tag**:
   ```bash
   git checkout main
   git pull origin main
   git tag v0.2.0
   git push origin v0.2.0
   ```

8. **Publish GitHub Release** (automated)

## Release Artifacts

### Build Artifacts
Generated during release process:

1. **Backend Server**: `ThingConnect.Pulse.Server.exe` + dependencies
2. **Windows Service**: Service-ready deployment
3. **Frontend Assets**: Optimized React build in `wwwroot/`
4. **Installer**: `ThingConnect.Pulse.Setup.exe` (Inno Setup)
5. **Documentation**: Updated docs and schemas

### GitHub Release Assets

Automatically attached to GitHub releases:
- `ThingConnect.Pulse.v0.2.0.zip` - Complete application package
- `ThingConnect.Pulse.Setup.exe` - Windows installer
- `CHANGELOG.md` - Release notes and version history
- `config.schema.json` - Configuration schema
- Source code (automatic GitHub archive)

## Automated Release Workflow

### GitHub Actions Integration
`.github/workflows/release-drafter.yml` automatically:

1. **Detects commits to main branch**
2. **Categorizes changes** by commit type:
   - `feat:` → Features
   - `fix:` → Bug Fixes  
   - `docs:` → Documentation
   - `refactor:` → Refactoring
   - `test:` → Testing
   - `ci:` → CI/CD

3. **Generates draft release notes**
4. **Suggests next version number**
5. **Creates GitHub Release draft**

### Release Notes Template

```markdown
# ThingConnect Pulse v0.2.0

## 🚀 Features
- New monitoring dashboard with real-time updates
- CIDR subnet discovery for automated endpoint detection

## 🐛 Bug Fixes  
- Fixed memory leak in background monitoring service
- Corrected timezone handling in rollup calculations

## 📚 Documentation
- Added security baseline documentation
- Updated API documentation with new endpoints

## 🔧 Maintenance
- Updated dependencies to latest versions
- Improved error handling and logging

## ⚡ Performance
- Optimized database queries for large datasets
- Reduced memory usage in monitoring loops

**Full Changelog**: https://github.com/MachDatum/ThingConnect.Pulse/compare/v0.1.0...v0.2.0
```

## Hotfix Process

### Emergency Bug Fixes

1. **Create hotfix branch** from latest release tag:
   ```bash
   git checkout v1.0.0
   git checkout -b hotfix/v1.0.1
   ```

2. **Apply minimal fix** addressing critical issue
3. **Update version** to patch number (1.0.0 → 1.0.1)
4. **Update CHANGELOG.md** with hotfix entry
5. **Test thoroughly** (automated + manual)
6. **Create PR** and get expedited review
7. **After merge, tag immediately**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

8. **Publish emergency release**

## Branch Protection Rules

### Main Branch Protection
- Require pull request reviews (1 reviewer minimum)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes (admin override available)
- Require signed commits (recommended)

### Release Branch Policy
- Release branches: `release/vX.Y.Z`
- Hotfix branches: `hotfix/vX.Y.Z`
- Feature branches: `feature/description`
- Bug fix branches: `fix/description`

## Version Support Policy

### Long-Term Support (LTS)
- **Current version**: Always supported
- **Previous minor**: Bug fixes only (6 months)
- **Previous major**: Critical security fixes (1 year)

### End-of-Life (EOL)
- Pre-1.0 versions: No long-term support
- 1.x versions: 2 years from initial release
- Security patches: High-severity only after EOL

## Release Validation

### Automated Testing
Before any release:
- [ ] Unit tests pass (backend)
- [ ] Integration tests pass (API)
- [ ] Frontend tests pass (Jest/React Testing Library)
- [ ] End-to-end tests pass (Playwright)
- [ ] Security scan clean
- [ ] Performance benchmarks acceptable

### Manual Validation
- [ ] Installation testing (fresh install)
- [ ] Upgrade testing (from previous version)  
- [ ] Configuration migration testing
- [ ] Core functionality smoke test
- [ ] Documentation accuracy review

## Release Communication

### Internal Team
- Pre-release: Development team notification
- Beta release: QA team and early adopters
- Stable release: All stakeholders

### External Users
- GitHub Releases: Technical release notes
- Documentation: Updated user guides
- Security advisories: If applicable

## Tools and Scripts

### Version Management
```bash
# Bump version script
./scripts/bump-version.sh 0.2.0

# Build release artifacts
./scripts/build-release.sh v0.2.0

# Validate release
./scripts/validate-release.sh v0.2.0
```

### Release Checklist Tool
```bash
# Interactive release checklist
./scripts/release-checklist.sh
```

## Rollback Procedures

### Failed Release
1. **Stop deployment** immediately
2. **Assess impact** and affected systems
3. **Decide**: Fix forward or rollback
4. **If rollback**:
   ```bash
   # Revert to previous tag
   git checkout v0.1.9
   ./scripts/emergency-deploy.sh v0.1.9
   ```

5. **Communicate** to users and stakeholders
6. **Post-mortem** analysis and prevention

## Metrics and Monitoring

### Release Success Metrics
- Deployment success rate
- Time from tag to production
- Rollback frequency
- User adoption of new versions

### Quality Metrics
- Bug escape rate from releases
- Security vulnerabilities in releases
- Performance regression detection
- User-reported issues by version

## Future Improvements

### Planned Enhancements
- Automated deployment pipeline
- Blue-green deployment strategy
- Feature flags for gradual rollout
- Automated rollback triggers
- Advanced A/B testing capabilities

---

**Document Version**: 1.0  
**Last Updated**: 2024-08-25  
**Next Review**: 2024-11-25  
**Owner**: ThingConnect Development Team