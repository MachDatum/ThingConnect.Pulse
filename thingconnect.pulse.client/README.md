# ThingConnect Pulse - Frontend

React-based web interface for the ThingConnect Pulse network monitoring system.

## ✅ Current Status

**Issue #17 - App Shell & Routing: COMPLETED**

- Complete application routing with React Router v7
- Responsive layout with mobile-first design
- ThingConnect branding and theming
- Playwright testing support
- Production build ready

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev
# Opens on https://localhost:55608 (or next available port)

# Production build
npm run build

# Code quality
npm run lint
npm run format
```

## Project Structure

```
src/
├── components/
│   ├── layout/           # App shell components
│   │   ├── AppShell.tsx  # Main layout wrapper
│   │   ├── Header.tsx    # Top navigation header
│   │   ├── Navigation.tsx # Sidebar navigation
│   │   └── Footer.tsx    # Footer component
│   ├── ui/              # Chakra UI components
│   ├── LazyWrapper.tsx  # Suspense wrapper
│   └── PageLoader.tsx   # Loading spinner
├── pages/               # Route components
│   ├── Dashboard.tsx    # Main status dashboard (/)
│   ├── History.tsx      # Historical data (/history)
│   ├── Config.tsx       # Configuration UI (/config)
│   ├── Settings.tsx     # App settings (/settings)
│   ├── EndpointDetail.tsx # Endpoint details (/endpoints/:id)
│   └── NotFound.tsx     # 404 page
├── router/
│   └── index.tsx        # Route configuration
├── api/
│   ├── client.ts        # Axios HTTP client
│   └── types.ts         # API type definitions
├── utils/
│   └── testIds.ts       # Playwright test identifiers
├── assets/              # Static assets (logos, images)
├── providers/           # React context providers
└── types/               # TypeScript type definitions
```

## Key Features

### ✅ Implemented

- **Responsive Layout**: Mobile-first design with breakpoint-based navigation
- **React Router v7**: Lazy-loaded routes with code splitting
- **Chakra UI v3**: Modern component library with theming
- **ThingConnect Branding**: Logo integration and consistent styling
- **Dark/Light Mode**: Theme toggle in header
- **Mobile Navigation**: Collapsible sidebar with overlay
- **Test Ready**: Playwright test identifiers and accessibility labels
- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code quality enforcement with auto-fixing

### 🚧 Planned (Issue #18+)

- Real-time dashboard with live endpoint status
- Historical data visualization with charts
- Configuration management UI
- Settings management interface
- CSV export functionality

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **UI Framework**: Chakra UI v3
- **Icons**: Lucide React v0.541.0
- **Build Tool**: Vite v7
- **HTTP Client**: Axios
- **State Management**: TanStack Query (React Query)
- **Testing**: Playwright (test identifiers ready)
- **Code Quality**: ESLint, Prettier

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint -- --fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

## Environment Configuration

Create `.env` file in project root:

```env
# API Configuration
VITE_API_BASE_URL=https://localhost:7227/api
VITE_API_TIMEOUT=30000

# Development
VITE_DEV_TOOLS=true
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Development Notes

- All components use Chakra UI v3 API
- Mobile-first responsive design approach
- Lazy loading for optimal performance
- TypeScript strict mode enabled
- Test identifiers follow `data-testid` convention
- ARIA labels for accessibility compliance

## Next Steps

Ready for **Issue #18: Live Board Page** implementation to add real-time monitoring dashboard functionality.
