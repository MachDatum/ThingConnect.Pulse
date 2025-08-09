# Chakra UI Theme & Customization Guide

This document provides comprehensive guidance for working with Chakra UI theming and customization in the ThingConnect.Pulse project.

## Theme Structure

### Tokens (Core Theme Tokens)

Non-semantic tokens that define the foundational design values:

- Colors: `gray.50`, `red.500`, `blue.100`, etc.
- Spacing, fonts, shadows, radii, and other design primitives

### Semantic Tokens

Context-aware tokens that automatically work for light and dark mode. **Always prefer semantic tokens over hard-coded color values**.

Available semantic tokens:

- **Background**: `bg`, `bg.subtle`, `bg.muted`, `bg.emphasized`, `bg.inverted`, `bg.panel`
- **Foreground**: `fg`, `fg.muted`, `fg.subtle`, `fg.inverted`
- **Borders**: `border`, `border.muted`, `border.subtle`, `border.emphasized`
- **Status Colors**: `*.error`, `*.warning`, `*.success`, `*.info` (where \* = bg, fg, border)
- **Color Palettes**: Each color has semantic variants: `contrast`, `fg`, `subtle`, `muted`, `emphasized`, `solid`, `focusRing`

### Text Styles

Consistent text styling that combines font size, font weight, and line height:

- Sizes: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`
- Special: `label` for form labels

### Layer Styles

Consistent container styling for common UI patterns:

- **Fill styles**: `fill.muted`, `fill.subtle`, `fill.surface`, `fill.solid`
- **Outline styles**: `outline.subtle`, `outline.solid`
- **Indicators**: `indicator.bottom`, `indicator.top`, `indicator.start`, `indicator.end`
- **States**: `disabled`, `none`

### Animation Styles

Shorthand for animation patterns (YOU MUST specify duration and ease when using):

- `slide-fade-in`, `slide-fade-out`
- `scale-fade-in`, `scale-fade-out`

## Theme Customization

### Adding Custom Colors

```typescript
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f2ff' },
          100: { value: '#bfdeff' },
          200: { value: '#99caff' },
          500: { value: '#0080ff' },
          950: { value: '#001a33' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: {
            value: {
              _light: '{colors.brand.700}',
              _dark: '{colors.brand.600}',
            },
          },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
```

**Important**: For new colors, YOU MUST create matching semantic tokens: `solid`, `contrast`, `fg`, `muted`, `subtle`, `emphasized`, `focusRing`.

### Adding Custom Text Styles

```typescript
const config = defineConfig({
  theme: {
    textStyles: {
      heading: {
        value: {
          fontSize: '24px',
          fontWeight: 'bold',
          lineHeight: '1.2',
        },
      },
      body: {
        value: {
          fontSize: '16px',
          fontWeight: 'normal',
          lineHeight: '1.5',
        },
      },
    },
  },
})
```

### Adding Custom Layer Styles

```typescript
const config = defineConfig({
  theme: {
    layerStyles: {
      card: {
        value: {
          background: 'bg.panel',
          borderRadius: 'md',
          padding: '4',
          boxShadow: 'sm',
        },
      },
      panel: {
        value: {
          background: 'bg.subtle',
          border: '1px solid',
          borderColor: 'border.muted',
          borderRadius: 'lg',
          padding: '6',
        },
      },
    },
  },
})
```

## TypeScript Support

To get proper autocompletion and type safety, YOU MUST run the typegen command after making theme changes:

```bash
npx @chakra-ui/cli typegen src/components/ui/theme/index.ts
```

This generates TypeScript definitions for your custom theme tokens.

## Best Practices

1. **Use Semantic Tokens**: Always prefer semantic tokens over raw color values
   - ✅ `color="fg.muted"`
   - ❌ `color="gray.600"`

2. **Dark Mode Support**: Semantic tokens automatically handle light/dark mode
   - Define light/dark variants using `_light` and `_dark` properties

3. **Consistent Spacing**: Use the predefined spacing tokens
   - `padding="4"`, `margin="2"`, `gap="6"`

4. **Text Consistency**: Use textStyles for consistent typography
   - `textStyle="lg"` instead of manual fontSize/lineHeight

5. **Layer Styles for Containers**: Use layerStyles for consistent container patterns
   - `layerStyle="card"` for card-like containers

6. **Animation Consistency**: Always specify duration and ease with animationStyles
   ```typescript
   <Box
     animationStyle="slide-fade-in"
     animationDuration="0.3s"
     animationTimingFunction="ease-out"
   />
   ```

## Current Theme Structure

The project uses an Atlassian-inspired design system with:

- **Brand colors**: ThingConnect blue palette
- **Accent colors**: Teal secondary palette
- **Status colors**: Success (green), warning (yellow), danger (red)
- **Neutral grays**: Clean, accessible gray scale
- **Atlassian typography**: Clean, readable font hierarchy
- **Enterprise layer styles**: Card, panel, header, modal, button variants

All theme files are located in `src/components/ui/theme/`.
