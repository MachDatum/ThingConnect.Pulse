# Development Workflow and Standards

## Code Style and Conventions
- **C# Backend**: Following standard C# conventions
  - PascalCase for public members, classes, methods
  - camelCase for private fields with underscore prefix (_field)
  - Use `sealed` classes where appropriate
  - Comprehensive XML documentation comments for public APIs
  - Consistent error handling with try-catch blocks
  - Structured logging with Serilog
  - Dependency injection pattern throughout

- **Authentication & Authorization**:
  - Cookie-based authentication using ASP.NET Core Identity
  - Role-based authorization (Administrator, User roles)
  - Proper 401/403 responses for API endpoints
  - Session validation and user activity tracking

- **API Design**:
  - RESTful endpoints with proper HTTP verbs
  - Consistent route patterns: `/api/[controller]/[action]`
  - Standard HTTP status codes (200, 400, 401, 403, 404, 500)
  - Structured error responses with validation details
  - DTO pattern for request/response models

## Testing Strategy
- **Backend Testing**: NUnit framework
- Tests should be created for all new controllers and services
- Focus on unit tests for business logic
- Integration tests for API endpoints

## Task Completion Checklist
When completing a task, ensure:
1. **Code Quality**:
   - Code compiles without warnings
   - Follows established naming conventions
   - Includes proper error handling
   - Has appropriate logging statements

2. **Testing**:
   - Run `dotnet test` to ensure all tests pass
   - Add new tests for new functionality
   - Verify frontend builds with `npm run build`

3. **Documentation**:
   - Update XML comments for new public APIs
   - Update configuration schema if config changes
   - Update OpenAPI spec if API changes

4. **Build Verification**:
   - Backend builds successfully: `dotnet build`
   - Frontend builds successfully: `npm run build`
   - Service can be installed and started if changes affect service

## Issue Management
- Follow GitHub issues in `/issues/` and `/pulse_env_issues/` folders
- Issues are prefixed: SEC-XX (specs/docs), ENV-XX (environment/setup)
- Priority levels: P1 (critical path), P2 (important), P3 (nice to have)
- Implement one issue at a time, complete with tests before moving on