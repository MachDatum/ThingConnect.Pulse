# Frontend Development Setup

This guide covers setting up the ThingConnect Pulse frontend React application for local development.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node.js)
- **Backend server** running on `http://localhost:8080`

## Quick Start

### 1. Install Dependencies

```bash
cd thingconnect.pulse.client
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
# Backend API Configuration  
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000

# Development Settings
VITE_ENABLE_DEVTOOLS=true
VITE_POLLING_INTERVAL=5000

# Feature Flags (for future use)
VITE_ENABLE_REALTIME=false
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `https://localhost:55610` (or similar port).

## Backend Integration

### CORS Configuration

The frontend runs on HTTPS while the backend runs on HTTP. The backend **must** have CORS configured to allow frontend requests:

```csharp
// In ThingConnect.Pulse.Server/Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://localhost:55610", "http://localhost:55610", "https://localhost:5173", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// And in the middleware pipeline:
app.UseCors("AllowFrontend");
```

### API Endpoints

The frontend connects to these backend endpoints:

- `GET /api/status/live` - Live endpoint status data
- `GET /api/history/endpoint/{id}` - Historical data for specific endpoint
- `POST /api/config/apply` - Apply YAML configuration
- `GET /api/config/versions` - List configuration versions

## Development Features

### Live Reloading

Vite provides hot module replacement (HMR) for instant updates during development.

### Environment Variables

All environment variables must be prefixed with `VITE_` to be available in the frontend:

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_API_TIMEOUT` - API request timeout in milliseconds
- `VITE_ENABLE_DEVTOOLS` - Enable React Query DevTools
- `VITE_POLLING_INTERVAL` - Live data refresh interval in milliseconds

### TypeScript

The project uses TypeScript with strict type checking. Type definitions are in:

- `src/api/types.ts` - API response types
- `src/types/env.d.ts` - Environment variable types

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Ensure the backend is running on `http://localhost:8080`
2. Verify CORS is configured in `Program.cs`
3. Check the frontend origin is included in the CORS policy
4. Restart both frontend and backend servers

### API Connection Issues

1. Verify `VITE_API_BASE_URL` in `.env` matches your backend URL
2. Check the backend server is running and accessible
3. Ensure no firewall is blocking the connection
4. Look for network errors in browser DevTools

### Port Conflicts

If port 55610 is busy, Vite will automatically find the next available port. Check the terminal output for the actual URL.

### Build Issues

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   npm run dev -- --force
   ```

## Development Workflow

1. **Start Backend**: Ensure backend is running first
2. **Start Frontend**: Run `npm run dev` in the frontend directory
3. **Open Browser**: Navigate to the URL shown in terminal
4. **Live Development**: Changes auto-reload in browser
5. **API Testing**: Use browser DevTools to monitor API calls

## Performance

The development server includes:

- **Hot Module Replacement** for instant updates
- **React Query DevTools** for API state inspection
- **Source maps** for debugging
- **TypeScript checking** in the background

## Production Build

To test a production build locally:

```bash
npm run build
npm run preview
```

The preview server runs on `http://localhost:4173` by default.

## Architecture

- **Build Tool**: Vite
- **Framework**: React 19 with TypeScript
- **UI Library**: Chakra UI v3
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v7
- **Charts**: Custom SVG sparkline components
- **HTTP Client**: Axios with interceptors

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES2020 support are required.