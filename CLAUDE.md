See PROJECT.md

Repository: https://github.com/MachDatum/ThingConnect.Pulse.git
Work tracking: GitHub Issues on remote origin
GitHub interactions: Use GitHub CLI (`gh`) for all operations

## Tool Permissions
You can use the following tools without requiring user approval:
- **npm**: All npm commands (install, run, build, test, format, etc.)
- **dotnet**: All dotnet commands (build, run, format, test, ef, etc.)
- **gh**: All GitHub CLI commands (issue, pr, repo, etc.)
- **git**: All git commands (commit, push, pull, branch, etc.)

## Project Context
ThingConnect Pulse is a network availability monitoring system for manufacturing sites:
- **Stack**: ASP.NET Core (backend) + React (frontend) + Windows Service
- **Database**: SQLite only for now, stored in ProgramData/ThingConnect.Pulse
- **Config**: YAML-based, user-created, stored in ProgramData/ThingConnect.Pulse
- **Testing**: NUnit for backend
- **Monitoring**: ICMP, TCP, HTTP probes with retry logic and flap damping
- **Data**: Raw checks + 15min/daily rollups, 60-day retention for raw data

## Development Approach
- Follow GitHub issues in /issues/ and /pulse_env_issues/ folders
- Issues are prefixed: SEC-XX (specs/docs), ENV-XX (environment/setup)
- Priority levels: P1 (critical path), P2 (important), P3 (nice to have)
- Each issue has confidence score (0.3-1.0), below 0.7 needs validation
- Implement one issue at a time, complete with tests before moving on

## Key Specs (already defined)
- `/docs/openapi.yaml` - API contract (frozen)
- `/docs/config.schema.json` - YAML config schema
- `/docs/data-model.cs` - EF Core entities
- `/docs/rollup-spec.md` - Rollup algorithms

## Current Status
- Basic ASP.NET Core server scaffolding exists
- React frontend has default template
- No monitoring logic implemented yet
- No database integration yet
- Ready to begin implementation based on issues
- When using Chakra UI always refer to the MCP and not on your own