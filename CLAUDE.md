# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

ThingConnect.Pulse is a full-stack web application with:

- **Backend**: ASP.NET Core 8.0 Web API (`ThingConnect.Pulse.Server/`)
  - Uses minimal API pattern with controllers
  - Swagger/OpenAPI integration for development
  - Configured as SPA proxy to serve the React frontend
  - Docker support with Linux containers

- **Frontend**: React 19 + TypeScript SPA (`thingconnect.pulse.client/`)
  - Built with Vite and SWC for fast compilation
  - Chakra UI v3 component library with custom theme system
  - TanStack Query for server state management
  - Next-themes for dark/light mode support
  - Axios for HTTP requests

## Development Commands

**IMPORTANT**: For development, run backend and frontend servers separately for optimal development experience.

### Frontend Development (run from `thingconnect.pulse.client/`)
```bash
npm run dev        # Start Vite development server (https://localhost:49812 or similar)
npm run build      # Build for production (TypeScript compile + Vite build)
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run preview    # Preview production build
```

### Backend Development (run from `ThingConnect.Pulse.Server/`)
```bash
dotnet run         # Start ASP.NET Core API server (https://localhost:7286)
dotnet build       # Build the backend project
dotnet watch       # Start with hot reload for development
```

### Development Workflow
1. **Terminal 1**: Start backend server from `ThingConnect.Pulse.Server/`
   ```bash
   dotnet run
   ```
2. **Terminal 2**: Start frontend server from `thingconnect.pulse.client/`
   ```bash
   npm run dev
   ```

### Production Build (run from solution root)
```bash
dotnet run --project ThingConnect.Pulse.Server  # Serves built frontend via SPA proxy
```

## Development Setup

The project uses HTTPS certificates for local development. The Vite configuration automatically:
- Generates development certificates via `dotnet dev-certs https`
- Configures HTTPS proxy to the ASP.NET Core backend
- Sets up path aliases (`@/` → `src/`)

## Code Quality & Git Hooks

- **Husky** pre-commit hooks run `lint-staged`
- **lint-staged** automatically runs ESLint and Prettier on TypeScript files
- ESLint configuration includes React, TypeScript, and React Query rules
- Prettier handles code formatting

## Frontend Architecture Notes

- Main entry point: `src/main.tsx` with React StrictMode
- Chakra UI Provider wraps the entire app with color mode support
- Component structure follows Chakra UI v3 patterns
- Uses path-based imports with TypeScript path mapping
- The `App.tsx` is currently minimal (empty component)

## Backend Integration

- Frontend dev server proxies API calls to `https://localhost:7286` (or configured port)
- ASP.NET Core serves the built React app in production via static files
- API endpoints should be prefixed appropriately for proxy configuration