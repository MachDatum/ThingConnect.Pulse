# ThingConnect.Pulse Theme System

This directory contains the enterprise-focused theme configuration for ThingConnect.Pulse, built with Chakra UI v3, incorporating authentic ThingConnect brand colors, and following Atlassian Design System principles.

## Design System Foundation

### 🏗️ Atlassian Design System Integration
- **Design Tokens**: Follows Atlassian's token naming conventions and structure
- **4px Grid System**: Consistent spacing based on Atlassian's rhythm
- **Surface System**: Semantic background colors (default, sunken, raised, overlay)
- **Elevation**: Shadow system with light/dark mode variations
- **Typography**: 2025 typography refresh with bolder fonts and improved readability

### 🎨 ThingConnect Brand Colors
- **Primary Brand**: `#076bb3` - The signature ThingConnect blue extracted from logo
- **Secondary Accent**: `#16a5a4` - The distinctive ThingConnect teal from logo
- **Supporting Colors**: Dark variants `#124771` and `#097a7d` for depth and contrast
- **Semantic Colors**: Automatic light/dark mode support with semantic tokens
- **Status Colors**: Success, warning, danger, and neutral color schemes
- **Accessibility**: WCAG compliant color contrasts

### 🌙 Dark/Light Mode Support
- Seamless theme switching with `next-themes`
- Automatic system preference detection
- Smooth transitions between modes
- Enterprise-optimized color schemes for both modes

### 📐 Typography System
- Inter font family for modern, readable text
- Comprehensive text styles (display, heading, body, caption, overline)
- Consistent spacing and line heights
- Professional letter spacing

### 🧱 Layout Styles
Pre-built layer styles for common enterprise UI patterns:
- `enterprise.card` - Card containers with proper shadows and borders
- `enterprise.section` - Content sections with subtle backgrounds
- `enterprise.header` - Navigation and header areas
- `enterprise.sidebar` - Sidebar layouts with borders

## Usage

### Atlassian-Style Usage
```tsx
import { Box, Text, Heading } from "@chakra-ui/react"

function MyComponent() {
  return (
    <Box layerStyle="atlassian.card">
      <Heading textStyle="ui.heading.large">Enterprise Title</Heading>
      <Text textStyle="ui.body.medium" color="fg.muted">
        Professional content with Atlassian design principles
      </Text>
    </Box>
  )
}
```

### Legacy Enterprise Usage (Still Supported)
```tsx
function LegacyComponent() {
  return (
    <Box layerStyle="enterprise.card">
      <Heading textStyle="heading.large">Legacy Title</Heading>
      <Text textStyle="body.medium" color="fg.muted">
        Backward compatible with previous theme
      </Text>
    </Box>
  )
}
```

### Color Palette Usage
```tsx
// Use semantic tokens that automatically adapt to light/dark mode
<Button colorPalette="brand" variant="solid">
  Primary Action
</Button>

<Box bg="bg.panel" border="1px solid" borderColor="border">
  Themed container
</Box>
```

### Theme Toggle
```tsx
import { ColorModeButton } from "@/components/ui/color-mode"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Simple toggle button
<ColorModeButton />

// Full theme selection UI
<ThemeToggle />
```

## File Structure

```
src/theme/
├── index.ts          # Main theme configuration
├── global.css        # Global CSS styles
└── README.md         # This documentation
```

## Customization

To modify the theme:

1. Edit `src/theme/index.ts` to adjust colors, typography, or layout styles
2. Run the typegen command to update TypeScript types:
   ```bash
   npx @chakra-ui/cli typegen src/theme/index.ts
   ```
3. Restart your development server

## Color Tokens

### ThingConnect Brand Colors
- `brand.50` through `brand.950` - Full ThingConnect blue palette based on `#076bb3`
- `brand.solid` - Primary ThingConnect blue (`#076bb3`)
- `brand.fg` - Text color that adapts to light/dark mode
- `brand.muted` - Subtle background color
- `brand.emphasized` - Highlighted background color

### ThingConnect Accent Colors
- `accent.50` through `accent.950` - Full ThingConnect teal palette based on `#16a5a4`
- `accent.solid` - Secondary ThingConnect teal (`#16a5a4`)
- `accent.fg` - Accent text color that adapts to light/dark mode
- `accent.muted` - Subtle accent background color
- `accent.emphasized` - Highlighted accent background color

### Semantic Colors
- `bg` - Main background color
- `bg.panel` - Panel/card background
- `bg.muted` - Muted background
- `fg` - Primary text color
- `fg.muted` - Secondary text color
- `border` - Default border color
- `border.subtle` - Subtle border color

## Typography Styles

### Display Text
- `display.large` - 7xl, bold, tight spacing
- `display.medium` - 6xl, bold, tight spacing  
- `display.small` - 5xl, bold, comfortable spacing

### Headings
- `heading.large` - 4xl, semibold
- `heading.medium` - 3xl, semibold
- `heading.small` - 2xl, semibold

### Body Text
- `body.large` - lg, normal weight
- `body.medium` - md, normal weight
- `body.small` - sm, normal weight

### Utility Text
- `caption` - xs, medium weight, tracked
- `overline` - 2xs, bold, uppercase, widely tracked

## Development

The theme system includes automatic TypeScript type generation. After modifying the theme, run:

```bash
npx @chakra-ui/cli typegen src/theme/index.ts
```

This ensures full type safety and autocompletion for all custom tokens and styles.