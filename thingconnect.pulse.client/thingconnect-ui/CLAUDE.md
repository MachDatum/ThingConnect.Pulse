# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThingConnect UI is a component library for the ThingConnect platform, built with Chakra UI v3. It enforces design system consistency across all ThingConnect web applications.

**Stack:**
- React 19 + TypeScript
- Chakra UI v3 (design system foundation)
- Vite (build tool)
- ESLint (linting)
- Storybook (component documentation - planned)
- Playwright (testing)

## Design System Architecture

The system follows a hierarchical structure:
- **Tokens** → Design tokens (colors, spacing, typography)
- **Primitives** → Basic UI components from `@chakra-ui/react` (Box, Text, Button, etc.)
- **Recipes/Composites** → Pre-built patterns in `src/components/ui/` using compound components
- **Patterns** → Complex application components built from recipes/primitives
- **Documentation/Guardrails** → Usage guidelines and constraints

## Key Design Decisions (Locked)

- **Density**: Compact globally with control heights 32/36/40px
- **Edit Pattern**: Table row → Modal for create/edit (not Drawer)
- **Color Modes**: Light + Dark mode support (AA contrast compliance)
- **Icons**: Lucide via registry pattern (`<Icon name="..."/>`)
- **Forms**: Zod validation in app code, FormField handles wiring
- **Charts**: VisX integration planned (tokens will be added when needed)

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Testing
npx playwright test  # Run Playwright tests
npm run test         # Run Vitest tests (when configured)
```

## Component Architecture

### Chakra UI v3 Primitives (Available from `@chakra-ui/react`)
**IMPORTANT**: All fundamental primitive components are provided by Chakra UI v3. DO NOT create separate files for these:

- **Layout**: Box, Flex, Stack, HStack, VStack, Grid, SimpleGrid, Container, Center, Spacer, Wrap, AspectRatio
- **Typography**: Text, Heading, Strong, Em, Code, Kbd, Mark, Highlight
- **Forms**: Input, Textarea, Button, IconButton, Checkbox, Radio, Switch
- **Feedback**: Spinner, Badge, Toast, Alert, Progress, Skeleton
- **Media**: Image, Icon
- **Data Display**: Table, List, Card, Stat
- **Navigation**: Link, Tabs, Breadcrumb
- **Overlay**: Portal, Modal basics
- **Utilities**: VisuallyHidden, Show, Separator, ClientOnly

### Recipe/Composite Components (`src/components/ui/`)
These are pre-built, opinionated implementations using Chakra UI v3's compound component patterns:

- **provider.tsx**: Main ChakraProvider setup with defaultSystem
- **color-mode.tsx**: Color mode management for light/dark themes
- **Form recipes**: field.tsx, input-group.tsx, native-select.tsx, select.tsx
- **Layout recipes**: dialog.tsx, drawer.tsx, popover.tsx, accordion.tsx
- **Data display recipes**: data-list.tsx, progress.tsx, stat.tsx
- **Feedback recipes**: alert.tsx, toast.tsx, skeleton.tsx
- **Interactive recipes**: menu.tsx, hover-card.tsx, tooltip.tsx

### Component Development Guidelines

When creating or modifying components:

1. **Use primitives directly**: Import Box, Text, Button, etc. directly from `@chakra-ui/react` - never create files for these
2. **Use Chakra UI v3 MCP**: Always refer to the Chakra UI MCP for current v3 API patterns  
3. **Follow existing patterns**: Check similar components in `src/components/ui/` for recipe patterns
4. **Maintain density**: Ensure components follow compact density guidelines (32/36/40px heights)
5. **Support color modes**: Components must work in both light and dark modes
6. **Path aliases**: Use `@/*` imports for internal modules (configured in tsconfig)

### TypeScript Configuration

- **Strict mode**: Full TypeScript strict checking enabled
- **Path mapping**: `@/*` resolves to `./src/*`
- **Build info**: Uses `.tmp/` for build cache
- **Modern targets**: ES2022 with DOM libraries

## Future Packaging

Eventually packaged as `@thingconnect/ui` for consumption by ThingConnect applications.

## LLM Development Constraints

- **Always use Chakra UI v3**: Never suggest alternatives to Chakra UI
- **Never create primitive component files**: Box, Text, Button, etc. are imported from `@chakra-ui/react`
- **Only create recipe/composite components**: Files in `src/components/ui/` should be compound component patterns
- **Follow locked design decisions**: Don't suggest changes to density, edit patterns, or color modes
- **Use existing components**: Prefer composing from existing primitives and recipes over creating new ones
- **Maintain consistency**: Follow established patterns in component structure and naming