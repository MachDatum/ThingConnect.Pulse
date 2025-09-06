# ThingConnect Pulse - Task Completion Requirements

## Mandatory Commands After Task Completion

When any coding task is completed, you MUST run these commands to ensure code quality:

### Backend (.NET) Requirements
```bash
# 1. Format code (required)
dotnet format

# 2. Build in Release mode (treats warnings as errors)
dotnet build -c Release
```

### Frontend (React/TypeScript) Requirements  
```bash
cd thingconnect.pulse.client

# 1. Run linting (required)
npm run lint

# 2. Format code (required)
npm run format

# 3. Build for production (required)
npm run build
```

## Quality Gates

### Backend Quality Gates
- **Build Success**: `dotnet build -c Release` must pass without errors
- **Code Style**: `dotnet format --verify-no-changes` must pass
- **Analyzers**: All StyleCop and .NET analyzer warnings must be resolved
- **No Warnings**: Release builds treat warnings as errors (configured in Directory.Build.props)

### Frontend Quality Gates  
- **Linting**: `npm run lint` must pass without errors
- **Type Checking**: TypeScript compilation must succeed
- **Build**: `npm run build` must complete successfully
- **Formatting**: `npm run format` must be applied

## Testing Requirements

### Backend Testing
```bash
# Run tests (when test projects exist)
dotnet test

# Ensure tests pass before marking task complete
dotnet test --logger "console;verbosity=detailed"
```

### Frontend Testing
```bash
cd thingconnect.pulse.client

# Run tests (when implemented)
npm test

# Ensure all tests pass
npm run test:coverage
```

## Pre-Commit Verification

Before any commit, run this verification sequence:

```bash
# Full verification from project root
dotnet format --verify-no-changes
dotnet build -c Release
cd thingconnect.pulse.client
npm run lint
npm run format  
npm run build
cd ..
```

## Specific Requirements by Task Type

### API Development Tasks
- Swagger documentation must be updated
- API endpoints must be tested manually via Swagger UI
- Database migrations must be applied if schema changes
- Configuration changes must be documented

### Frontend Feature Tasks
- Chakra UI MCP tools must be used for all UI components
- Components must be responsive and follow design system
- TypeScript types must be properly defined
- React Query must be used for server state management

### Database Tasks
- EF Core migrations must be created and applied
- Database operations must be tested in both Development and Production mode
- Data models must follow the documented schema in /docs/data-model.cs

### Configuration Tasks
- YAML schema validation must pass
- Configuration changes must be backward compatible
- Sample configurations must be updated if needed

## Error Handling

### Build Failures
If builds fail due to new warnings:
1. Fix the underlying issue (preferred)
2. Add specific warnings to NoWarn in Directory.Build.props (temporary)
3. Document why the warning was suppressed

### Linting Failures
- All ESLint errors must be fixed
- Use `npm run lint -- --fix` for auto-fixable issues
- Manual fixes required for complex issues

## Never Skip These Steps

These requirements are MANDATORY and must never be skipped:
1. Code formatting (`dotnet format` and `npm run format`)
2. Build verification (`dotnet build -c Release` and `npm run build`)
3. Linting (`npm run lint`)
4. Pre-commit hooks (Husky will enforce these automatically)

## Documentation Updates

When completing tasks that affect:
- **API Changes**: Update /docs/openapi.yaml
- **Configuration**: Update config.schema.json and sample-config.yaml
- **Database**: Update /docs/data-model.cs
- **Setup Instructions**: Update README.md or /ops/dev.md

## Commit Standards

```bash
# Use conventional commits
git commit -m "feat: add endpoint monitoring dashboard"
git commit -m "fix: resolve authentication cookie expiration"  
git commit -m "docs: update API documentation"
git commit -m "refactor: improve error handling in probe service"
```

## Task Is Not Complete Until:
1. All quality gates pass
2. Code is formatted and builds successfully
3. Tests pass (when they exist)
4. Documentation is updated (if applicable)
5. Changes are committed with proper message
6. GitHub issue is updated or closed