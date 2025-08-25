# Quality Gates Documentation

## Overview

ThingConnect Pulse implements automated code quality gates to maintain high code standards, security, and reliability across both backend (C#) and frontend (TypeScript/React) codebases.

## Backend Quality Standards (C#)

### Code Analysis Tools
- **StyleCop Analyzers**: Code style and formatting enforcement
- **Microsoft.CodeAnalysis.NetAnalyzers**: .NET-specific code quality rules
- **Built-in C# analyzers**: Language best practices and performance

### Configuration
The quality gates are configured through:
- **`.editorconfig`**: Code style preferences and rule severity levels
- **Project files**: Analyzer package references and build settings
- **CI pipeline**: Automated enforcement in GitHub Actions

### Key Rules Enforced
1. **Critical Errors** (Build-breaking):
   - CA1001: Types that own disposable fields should be disposable
   - Memory leaks and resource management issues
   - Security-related code analysis rules

2. **Style Warnings** (Configurable severity):
   - SA1208: Using directive ordering
   - SA1402: Single type per file
   - SA1518: File endings and whitespace
   - SA1028: Trailing whitespace removal

### Suppression Policy
- **Global suppressions**: Applied via `.editorconfig` for project-wide exceptions
- **Code-level suppressions**: Use `#pragma warning disable` sparingly with justification
- **Review required**: All suppressions require code review approval

## Frontend Quality Standards (TypeScript/React)

### Linting Stack
- **ESLint**: JavaScript/TypeScript linting with TypeScript-aware rules
- **@typescript-eslint**: TypeScript-specific rules and type checking
- **React plugins**: React-specific best practices and hooks rules
- **Prettier**: Code formatting (integrated with ESLint)

### Configuration Files
- **`eslint.config.js`**: ESLint configuration with TypeScript support
- **`tsconfig.json`**: TypeScript compiler options and type checking
- **`.prettierrc`** (if present): Code formatting preferences

### Key Rules Categories
1. **Type Safety** (Errors):
   - `@typescript-eslint/no-unsafe-*`: Prevent `any` type usage
   - `@typescript-eslint/no-unused-vars`: Remove unused variables
   - `@typescript-eslint/no-misused-promises`: Proper async/await usage

2. **React Best Practices** (Warnings):
   - `react-x/no-array-index-key`: Proper key usage in lists
   - `react-hooks/rules-of-hooks`: Hook usage compliance
   - `react-refresh/only-export-components`: Fast refresh compatibility

3. **Code Quality** (Mixed):
   - `@typescript-eslint/no-floating-promises`: Promise handling
   - `@typescript-eslint/no-empty-object-type`: Meaningful interfaces

### Formatting Standards
- **Indentation**: 2 spaces for TS/JS/JSON, 4 spaces for C#
- **Line endings**: CRLF (Windows-consistent)
- **Semicolons**: Required in TypeScript
- **Quotes**: Single quotes preferred for strings
- **Trailing commas**: Required in multiline structures

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/quality-gates.yml`)

The quality gate pipeline runs on:
- All pushes to `master` and `develop` branches
- All pull requests targeting `master` and `develop`

### Pipeline Stages

#### 1. Backend Quality Gate
```yaml
- Restore .NET dependencies
- Build with analyzer enforcement (Release configuration)
- Run unit tests (if test projects exist)
- Fail on any analyzer errors or test failures
```

#### 2. Frontend Quality Gate
```yaml
- Install Node.js dependencies
- Run ESLint with error enforcement
- Check Prettier formatting compliance
- Build production bundle
- Fail on lint errors or build failures
```

#### 3. Security Analysis
```yaml
- Run npm audit for frontend dependency vulnerabilities
- Execute Microsoft DevSkim for security pattern detection
- Generate security report artifacts
- Allow security warnings (non-blocking)
```

### Quality Gate Failure Handling

**Build-breaking conditions:**
- C# analyzer errors (not warnings)
- TypeScript compilation errors
- ESLint errors (not warnings)
- Unit test failures
- Build/bundling failures

**Non-blocking conditions:**
- Style warnings (SA#### rules set to `suggestion`)
- Security scan findings (reported but not blocking)
- npm audit moderate/low vulnerabilities

## Local Development Workflow

### Pre-commit Checks
The project includes optional git hooks for local quality enforcement:

```bash
# Install pre-commit hooks (optional)
cd thingconnect.pulse.client
npm run prepare
```

### Manual Quality Checks

**Backend analysis:**
```bash
dotnet build ThingConnect.Pulse.Server --configuration Release
# Review analyzer warnings and errors
```

**Frontend analysis:**
```bash
cd thingconnect.pulse.client
npm run lint          # Check for ESLint issues
npm run lint -- --fix # Auto-fix applicable issues
npm run format         # Format with Prettier
npm run format -- --check # Check formatting without changes
```

### IDE Integration

**Visual Studio / VS Code:**
- Analyzers run automatically during development
- `.editorconfig` settings applied on file save
- Real-time error highlighting and suggestions

**Recommended Extensions:**
- **C#**: C# Dev Kit, C# Extensions
- **TypeScript**: ESLint, Prettier, TypeScript Hero
- **General**: EditorConfig for VS Code

## Customization and Updates

### Adding New Rules
1. **Backend**: Update `.editorconfig` with new diagnostic IDs
2. **Frontend**: Modify `eslint.config.js` rule configuration
3. **Testing**: Verify rules don't break existing codebase
4. **Documentation**: Update this document with rule justification

### Severity Level Guidelines
- **Error**: Security issues, potential bugs, breaking changes
- **Warning**: Style issues, best practices, maintainability
- **Suggestion**: Preferences, minor improvements
- **None**: Disabled rules that don't apply to this project

### Rule Suppression Process
1. **Justification required**: Document why the rule should be suppressed
2. **Scope minimization**: Use most specific suppression possible
3. **Review approval**: All suppressions require code review
4. **Periodic review**: Evaluate suppressions during refactoring

## Quality Metrics and Reporting

### Current Status
- **Backend**: ~138 style warnings, 0 critical errors (as of setup)
- **Frontend**: 49 linting issues (31 errors, 18 warnings)
- **Target**: Gradual reduction through focused cleanup efforts

### Monitoring and Trends
- **CI/CD dashboard**: GitHub Actions workflow status
- **Code review process**: Quality gate adherence in PRs
- **Regular cleanup**: Monthly quality improvement sprints

### Success Criteria
1. **All builds pass**: No analyzer errors in CI/CD
2. **Clean new code**: New features pass all quality gates
3. **Gradual improvement**: Existing warning count decreases over time
4. **Security compliance**: All high/critical vulnerabilities addressed

## Troubleshooting

### Common Issues

**"Build failed due to analyzer errors":**
- Review the specific analyzer rule documentation
- Consider if suppression is appropriate with justification
- Fix the underlying code issue rather than suppress when possible

**"ESLint errors blocking commit":**
- Run `npm run lint -- --fix` to auto-resolve fixable issues
- Address remaining errors manually
- Consider temporary rule adjustment if needed for refactoring

**"Formatting check failed":**
- Run `npm run format` to apply Prettier formatting
- Verify `.editorconfig` settings match team preferences
- Check for conflicting formatting tool configurations

### Getting Help
1. **Rule documentation**: Follow links in error messages for rule explanations
2. **Team consultation**: Discuss suppressions and rule changes in code review
3. **Tool updates**: Keep analyzer packages and ESLint plugins updated
4. **Community resources**: Consult StyleCop, ESLint, and TypeScript communities

---

This quality gate system ensures ThingConnect Pulse maintains professional code standards while remaining practical for rapid development and deployment cycles.