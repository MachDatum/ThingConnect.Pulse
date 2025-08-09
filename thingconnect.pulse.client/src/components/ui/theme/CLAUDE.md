# ThingConnect.Pulse Theme System

This document describes the complete Chakra UI theme configuration for ThingConnect.Pulse, based on Atlassian Design System principles.

## Theme Structure

The theme is split across multiple files for better organization:

- `index.ts` - Main theme configuration with semantic tokens, typography, and layer styles
- `colors.ts` - All color definitions using `defineTokens.colors()`

## Color System

### Core Color Palettes

The theme includes comprehensive color palettes with specific shade ranges:

#### Blue (Primary Brand Color)

- **Range**: 100-1000 (no 50)
- **Key shades**:
  - `blue.500` (#388BFF) - Primary blue
  - `blue.700` (#0C66E4) - Dark accent
  - `blue.900` (#09326C) - Darkest

#### Red (Status/Error Color)

- **Range**: 100-1000
- **Key shades**:
  - `red.500` (#F15B50) - Primary red
  - `red.600` (#E2483D) - Medium dark
  - `red.1000` (#42221F) - Darkest

#### Green (Success Color)

- **Range**: 100-1000
- **Key shades**:
  - `green.500` (#2ABB7F) - Success green
  - `green.400` (#4BCE97) - Light success

#### Other Colors

- **Yellow**: 100-1000 (warning states)
- **Purple**: 100-1000 (accent color)
- **Teal**: 100-1000 (secondary accent)
- **Orange**: 100-1000 (additional status)
- **Gray**: 100-1000 (neutrals with fine-grained steps)

#### Special Palettes

- **Neutrals**: 0, 100-1100, plus alpha variants (100A-500A)
- **Dark Neutrals**: -100 to 1100, plus alpha variants
- **White/Black Alpha**: 50-950 (transparency variants)

### Semantic Color Tokens

Each color family has semantic variants that adapt to light/dark mode:

```typescript
// Example for blue
blue: {
  solid: { value: '{colors.blue.500}' },          // Solid background
  contrast: { value: 'white' },                   // Contrasting text
  fg: {                                            // Foreground text
    value: {
      _light: '{colors.blue.600}',
      _dark: '{colors.blue.400}',
    },
  },
  muted: {                                         // Muted background
    value: {
      _light: '{colors.blue.100}',
      _dark: '{colors.blue.900}',
    },
  },
  subtle: { /* ... */ },                          // Subtle background
  emphasized: { /* ... */ },                      // Emphasized state
  focusRing: { value: '{colors.blue.500}' },      // Focus indicators
}
```

### Global Semantic Tokens

Atlassian-style surface tokens for consistent theming:

- `color.background.default` - Main background
- `color.background.sunken` - Recessed areas
- `color.background.raised` - Elevated surfaces
- `color.background.overlay` - Modal/overlay backgrounds

Legacy tokens for compatibility:

- `bg`, `bg.panel` - Background surfaces
- `fg`, `fg.muted`, `fg.subtle` - Text colors
- `border`, `border.muted`, `border.subtle` - Border colors

## Typography System

### Font Stack

All text uses Atlassian Sans with system fallbacks:

```
'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont,
'Segoe UI', Roboto, Helvetica, Arial, sans-serif
```

### Text Styles

#### Heading Scales

- `ui.heading.xxlarge` - 72px, weight 600
- `ui.heading.xlarge` - 60px, weight 600
- `ui.heading.large` - 48px, weight 600
- `ui.heading.medium` - 36px, weight 500
- `ui.heading.small` - 30px, weight 500
- `ui.heading.xsmall` - 24px, weight 500
- `ui.heading.xxsmall` - 20px, weight 500

#### Body Text

- `ui.body.large` - 18px, line-height 1.556
- `ui.body.medium` - 16px, line-height 1.5 (default)
- `ui.body.small` - 14px, line-height 1.429

#### Utility Styles

- `ui.helper` - 12px helper text
- `ui.code` - 14px monospace code

### Font Sizes

Precise scale from 2xs (10px) to 7xl (72px):

- `2xs`: 0.625rem (10px)
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `md`: 1rem (16px) - default
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)
- `6xl`: 3.75rem (60px)
- `7xl`: 4.5rem (72px)

## Spacing System

Atlassian Design System 4px grid-based spacing:

- `025`: 0.125rem (2px) - minimal
- `050`: 0.25rem (4px) - space.050
- `075`: 0.375rem (6px) - space.075
- `100`: 0.5rem (8px) - space.100
- `150`: 0.75rem (12px) - space.150
- `200`: 1rem (16px) - space.200
- `250`: 1.25rem (20px) - space.250
- `300`: 1.5rem (24px) - space.300
- `400`: 2rem (32px) - space.400
- `500`: 2.5rem (40px) - space.500
- `600`: 3rem (48px) - space.600
- `800`: 4rem (64px) - space.800
- `1000`: 5rem (80px) - space.1000

## Border Radius

Atlassian-inspired radius scale:

- `none`: 0
- `sm`: 2px
- `base`: 3px (Atlassian button standard)
- `md`: 4px
- `lg`: 6px
- `xl`: 8px
- `2xl`: 12px
- `3xl`: 16px
- `full`: 9999px

## Shadows

Atlassian elevation system:

- `raised`: Subtle card elevation
- `overlay`: Modal/popover shadows
- `xs`, `sm`, `base`, `md`, `lg`: Progressive elevation
- Dark mode variants: `raised.dark`, `overlay.dark`

## Gradients

Subtle brand gradients:

- `brand.subtle`: Blue gradient
- `accent.subtle`: Teal to green
- `surface.overlay`: Dark overlay
- `surface.overlay.light`: Light overlay

## Layer Styles

### Atlassian Component Styles

#### Cards & Panels

```typescript
'atlassian.card': {
  bg: 'color.background.raised',
  borderRadius: 'base',
  border: '1px solid',
  borderColor: 'border.muted',
  boxShadow: 'raised',
  p: '200', // 16px
}

'atlassian.panel': {
  bg: 'color.background.sunken',
  borderRadius: 'base',
  border: '1px solid',
  borderColor: 'border.subtle',
  p: '300', // 24px
}
```

#### Buttons

```typescript
'atlassian.button.primary': {
  bg: 'blue.500',
  color: 'white',
  borderRadius: 'base',
  px: '200',
  py: '100',
  minHeight: '32px',
}

'atlassian.button.secondary': {
  bg: 'transparent',
  color: 'blue.500',
  border: '1px solid',
  borderColor: 'blue.500',
  borderRadius: 'base',
  px: '200',
  py: '100',
  minHeight: '32px',
}
```

#### Layout Elements

```typescript
'atlassian.header': {
  bg: 'color.background.default',
  borderBottom: '1px solid',
  borderColor: 'border.muted',
  px: '200',
  py: '150',
  minHeight: '44px',
}

'atlassian.modal': {
  bg: 'color.background.overlay',
  borderRadius: 'lg',
  boxShadow: 'overlay',
  p: '300',
}
```

## Usage Guidelines

### Color Usage

1. **Always prefer semantic tokens** over raw color values
   - ✅ `bg="blue.subtle"`
   - ❌ `bg="blue.100"`

2. **Use appropriate color families**
   - Blue: Primary actions, links
   - Red: Errors, destructive actions
   - Green: Success states
   - Yellow: Warnings
   - Purple: Special features

3. **Leverage automatic light/dark mode**
   - Semantic tokens automatically adapt
   - Use `_light` and `_dark` variants when needed

### Typography Usage

1. **Use text styles for consistency**
   - ✅ `textStyle="ui.body.medium"`
   - ❌ Manual fontSize/lineHeight

2. **Maintain hierarchy**
   - Headings: xxlarge → xxsmall
   - Body: large → small
   - Helper text: ui.helper

### Spacing Usage

1. **Follow the 4px grid**
   - Use spacing tokens: `p="200"` (16px)
   - Avoid arbitrary values

2. **Consistent patterns**
   - Cards: padding `200` (16px)
   - Panels: padding `300` (24px)
   - Headers: padding `150`/`200` (12px/16px)

### Layer Style Usage

1. **Use Atlassian layer styles**
   - `layerStyle="atlassian.card"` for cards
   - `layerStyle="atlassian.button.primary"` for primary buttons

2. **Maintain touch targets**
   - Minimum 32px height for interactive elements
   - Consistent 44px header height

## Dark Mode Support

The theme automatically supports dark mode through:

- Semantic tokens with `_light`/`_dark` variants
- Global CSS that respects `colorScheme`
- Automatic color inversion for appropriate elements

## File Organization

```
src/components/ui/theme/
├── index.ts          # Main theme config
├── colors.ts         # Color definitions
└── CLAUDE.md         # This documentation
```

The theme is exported as `system` from `index.ts` and should be used with Chakra UI's Provider.
