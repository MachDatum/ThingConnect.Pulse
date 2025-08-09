import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { colors } from './colors'

const config = defineConfig({
  theme: {
    tokens: {
      colors: colors,
      fonts: {
        heading: {
          value:
            "'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        body: {
          value:
            "'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        mono: {
          value: "SF Mono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        },
      },
      fontSizes: {
        '2xs': { value: '0.625rem' }, // 10px
        xs: { value: '0.75rem' }, // 12px
        sm: { value: '0.875rem' }, // 14px
        md: { value: '1rem' }, // 16px
        lg: { value: '1.125rem' }, // 18px
        xl: { value: '1.25rem' }, // 20px
        '2xl': { value: '1.5rem' }, // 24px
        '3xl': { value: '1.875rem' }, // 30px
        '4xl': { value: '2.25rem' }, // 36px
        '5xl': { value: '3rem' }, // 48px
        '6xl': { value: '3.75rem' }, // 60px
        '7xl': { value: '4.5rem' }, // 72px
      },
      spacing: {
        // Atlassian Design System 4px grid spacing tokens
        '025': { value: '0.125rem' }, // 2px - minimal spacing
        '050': { value: '0.25rem' }, // 4px - space.050
        '075': { value: '0.375rem' }, // 6px - space.075
        '100': { value: '0.5rem' }, // 8px - space.100
        '150': { value: '0.75rem' }, // 12px - space.150
        '200': { value: '1rem' }, // 16px - space.200
        '250': { value: '1.25rem' }, // 20px - space.250
        '300': { value: '1.5rem' }, // 24px - space.300
        '400': { value: '2rem' }, // 32px - space.400
        '500': { value: '2.5rem' }, // 40px - space.500
        '600': { value: '3rem' }, // 48px - space.600
        '800': { value: '4rem' }, // 64px - space.800
        '1000': { value: '5rem' }, // 80px - space.1000
      },
      radii: {
        none: { value: '0' },
        sm: { value: '0.125rem' }, // 2px
        base: { value: '0.1875rem' }, // 3px - Atlassian button border radius
        md: { value: '0.25rem' }, // 4px
        lg: { value: '0.375rem' }, // 6px
        xl: { value: '0.5rem' }, // 8px
        '2xl': { value: '0.75rem' }, // 12px
        '3xl': { value: '1rem' }, // 16px
        full: { value: '9999px' },
      },
      shadows: {
        // Atlassian-inspired shadow system - subtle and clean
        raised: { value: '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
        overlay: { value: '0 8px 16px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
        'raised.dark': { value: '0 1px 1px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.31)' },
        'overlay.dark': { value: '0 8px 16px rgba(0, 0, 0, 0.36), 0 0 1px rgba(0, 0, 0, 0.31)' },
        // Atlassian elevation shadows
        xs: { value: '0 1px 1px rgba(9, 30, 66, 0.25)' },
        sm: { value: '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
        base: { value: '0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
        md: { value: '0 8px 16px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
        lg: { value: '0 16px 24px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' },
      },
      gradients: {
        // Atlassian subtle gradients for overlays and backgrounds
        'brand.subtle': { value: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)' },
        'accent.subtle': { value: 'linear-gradient(135deg, #00b8d9 0%, #36b37e 100%)' },
        'surface.overlay': { value: 'linear-gradient(rgba(9, 30, 66, 0), rgba(9, 30, 66, 0.6))' },
        'surface.overlay.light': {
          value: 'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9))',
        },
      },
    },
    semanticTokens: {
      colors: {
        // Blue semantic tokens
        blue: {
          solid: { value: '{colors.blue.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.blue.600}',
              _dark: '{colors.blue.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.blue.100}',
              _dark: '{colors.blue.900}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.blue.100}',
              _dark: '{colors.blue.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.blue.200}',
              _dark: '{colors.blue.800}',
            },
          },
          focusRing: { value: '{colors.blue.500}' },
        },
        // Teal semantic tokens
        teal: {
          solid: { value: '{colors.teal.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.teal.600}',
              _dark: '{colors.teal.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.teal.50}',
              _dark: '{colors.teal.1000}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.teal.100}',
              _dark: '{colors.teal.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.teal.200}',
              _dark: '{colors.teal.800}',
            },
          },
          focusRing: { value: '{colors.teal.500}' },
        },
        // Green semantic tokens
        green: {
          solid: { value: '{colors.green.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.green.600}',
              _dark: '{colors.green.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.green.50}',
              _dark: '{colors.green.1000}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.green.100}',
              _dark: '{colors.green.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.green.200}',
              _dark: '{colors.green.800}',
            },
          },
          focusRing: { value: '{colors.green.500}' },
        },
        // Yellow semantic tokens
        yellow: {
          solid: { value: '{colors.yellow.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.yellow.600}',
              _dark: '{colors.yellow.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.yellow.50}',
              _dark: '{colors.yellow.1000}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.yellow.100}',
              _dark: '{colors.yellow.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.yellow.200}',
              _dark: '{colors.yellow.800}',
            },
          },
          focusRing: { value: '{colors.yellow.500}' },
        },
        // Red semantic tokens
        red: {
          solid: { value: '{colors.red.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.red.600}',
              _dark: '{colors.red.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.red.50}',
              _dark: '{colors.red.1000}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.red.100}',
              _dark: '{colors.red.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.red.200}',
              _dark: '{colors.red.800}',
            },
          },
          focusRing: { value: '{colors.red.500}' },
        },
        // Purple semantic tokens
        purple: {
          solid: { value: '{colors.purple.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.purple.600}',
              _dark: '{colors.purple.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.purple.50}',
              _dark: '{colors.purple.1000}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.purple.100}',
              _dark: '{colors.purple.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.purple.200}',
              _dark: '{colors.purple.800}',
            },
          },
          focusRing: { value: '{colors.purple.500}' },
        },
        // Neutral semantic tokens
        neutral: {
          solid: { value: '{colors.neutral.500}' },
          contrast: { value: 'white' },
          fg: {
            value: {
              _light: '{colors.neutral.600}',
              _dark: '{colors.neutral.400}',
            },
          },
          muted: {
            value: {
              _light: '{colors.neutral.50}',
              _dark: '{colors.neutral.950}',
            },
          },
          subtle: {
            value: {
              _light: '{colors.neutral.100}',
              _dark: '{colors.neutral.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.neutral.200}',
              _dark: '{colors.neutral.800}',
            },
          },
          focusRing: { value: '{colors.neutral.500}' },
        },
        // Atlassian-style surface semantic tokens using neutral palette
        'color.background.default': {
          value: {
            _light: '{colors.neutral.0}', // N0 - Pure white
            _dark: '{colors.neutral.1000}', // N1000 - Darkest background
          },
        },
        'color.background.sunken': {
          value: {
            _light: '{colors.neutral.20}', // N20 - Light gray sunken
            _dark: '{colors.blue.1000}', // B1000 - Dark blue sunken
          },
        },
        'color.background.raised': {
          value: {
            _light: '{colors.neutral.0}', // N0 - Pure white raised
            _dark: '{colors.blue.800}', // B800 - Dark blue raised
          },
        },
        'color.background.overlay': {
          value: {
            _light: '{colors.neutral.0}', // N0 - Pure white overlay
            _dark: '{colors.blue.700}', // B700 - Dark blue overlay
          },
        },
        // Legacy background tokens for compatibility with Atlassian neutrals
        bg: {
          value: {
            _light: '{colors.neutral.20}', // N20 - Light gray background
            _dark: '{colors.neutral.1000}', // N1000 - Dark background
          },
        },
        'bg.panel': {
          value: {
            _light: '{colors.neutral.0}', // N0 - Pure white
            _dark: '{colors.neutral.900}', // N900 - Dark panel
          },
        },
        fg: {
          value: {
            _light: '{colors.neutral.1000}', // N1000 - Dark text on light
            _dark: '{colors.neutral.0}', // N0 - Light text on dark
          },
        },
        'fg.muted': {
          value: {
            _light: '{colors.neutral.600}', // N600 - Muted text
            _dark: '{colors.neutral.400}', // N400 - Muted text dark
          },
        },
        'fg.subtle': {
          value: {
            _light: '{colors.neutral.500}', // N500 - Subtle text
            _dark: '{colors.neutral.500}', // N500 - Subtle text
          },
        },
        border: {
          value: {
            _light: '{colors.neutral.40}', // N40 - Light border
            _dark: '{colors.neutral.700}', // N700 - Dark border
          },
        },
        'border.muted': {
          value: {
            _light: '{colors.neutral.30}', // N30 - Muted border
            _dark: '{colors.neutral.800}', // N800 - Muted dark border
          },
        },
        'border.subtle': {
          value: {
            _light: '{colors.neutral.50}', // N50 - Subtle border
            _dark: '{colors.neutral.600}', // N600 - Subtle dark border
          },
        },
      },
    },
    textStyles: {
      // Atlassian typography scale - clean, accessible typography
      'ui.heading.xxlarge': {
        value: {
          fontSize: '7xl', // 72px
          fontWeight: '600', // Atlassian medium weight
          lineHeight: '1.125',
          letterSpacing: '-0.01em',
        },
      },
      'ui.heading.xlarge': {
        value: {
          fontSize: '6xl', // 60px
          fontWeight: '600',
          lineHeight: '1.133',
          letterSpacing: '-0.008em',
        },
      },
      'ui.heading.large': {
        value: {
          fontSize: '5xl', // 48px
          fontWeight: '600',
          lineHeight: '1.167',
          letterSpacing: '-0.006em',
        },
      },
      'ui.heading.medium': {
        value: {
          fontSize: '4xl', // 36px
          fontWeight: '500', // Atlassian medium
          lineHeight: '1.222',
          letterSpacing: '-0.004em',
        },
      },
      'ui.heading.small': {
        value: {
          fontSize: '3xl', // 30px
          fontWeight: '500',
          lineHeight: '1.267',
          letterSpacing: '-0.002em',
        },
      },
      'ui.heading.xsmall': {
        value: {
          fontSize: '2xl', // 24px
          fontWeight: '500',
          lineHeight: '1.333',
        },
      },
      'ui.heading.xxsmall': {
        value: {
          fontSize: 'xl', // 20px
          fontWeight: '500',
          lineHeight: '1.4',
        },
      },
      // Atlassian body text styles - optimized for readability
      'ui.body.large': {
        value: {
          fontSize: 'lg', // 18px
          fontWeight: '400',
          lineHeight: '1.556', // ~28px line height
        },
      },
      'ui.body.medium': {
        value: {
          fontSize: 'md', // 16px
          fontWeight: '400',
          lineHeight: '1.5', // 24px line height
        },
      },
      'ui.body.small': {
        value: {
          fontSize: 'sm', // 14px
          fontWeight: '400',
          lineHeight: '1.429', // ~20px line height
        },
      },
      // Helper text styles
      'ui.helper': {
        value: {
          fontSize: 'xs', // 12px
          fontWeight: '400',
          lineHeight: '1.333', // 16px line height
        },
      },
      // Code text style
      'ui.code': {
        value: {
          fontSize: 'sm', // 14px
          fontWeight: '400',
          lineHeight: '1.571', // ~22px
          fontFamily: 'mono',
        },
      },
    },
    layerStyles: {
      // Atlassian surface styles - clean and accessible
      'atlassian.card': {
        value: {
          bg: 'color.background.raised',
          borderRadius: 'base', // 3px - Atlassian border radius
          border: '1px solid',
          borderColor: 'border.muted',
          boxShadow: 'raised',
          p: '200', // 16px - consistent spacing
        },
      },
      'atlassian.panel': {
        value: {
          bg: 'color.background.sunken',
          borderRadius: 'base',
          border: '1px solid',
          borderColor: 'border.subtle',
          p: '300', // 24px
        },
      },
      'atlassian.header': {
        value: {
          bg: 'color.background.default',
          borderBottom: '1px solid',
          borderColor: 'border.muted',
          px: '200', // 16px
          py: '150', // 12px
          minHeight: '44px', // Atlassian touch target
        },
      },
      'atlassian.modal': {
        value: {
          bg: 'color.background.overlay',
          borderRadius: 'lg', // Larger radius for modals
          boxShadow: 'overlay',
          p: '300', // 24px
        },
      },
      'atlassian.button.primary': {
        value: {
          bg: 'blue.500',
          color: 'white',
          borderRadius: 'base', // 3px
          px: '200', // 16px
          py: '100', // 8px
          minHeight: '32px', // Atlassian button height
        },
      },
      'atlassian.button.secondary': {
        value: {
          bg: 'transparent',
          color: 'blue.500',
          border: '1px solid',
          borderColor: 'blue.500',
          borderRadius: 'base', // 3px
          px: '200', // 16px
          py: '100', // 8px
          minHeight: '32px', // Atlassian button height
        },
      },
      // Legacy styles for backward compatibility
      'enterprise.card': {
        value: {
          bg: 'color.background.raised',
          borderRadius: 'base',
          boxShadow: 'raised',
          p: '300',
        },
      },
      'enterprise.header': {
        value: {
          bg: 'color.background.default',
          borderBottom: '1px solid',
          borderColor: 'border',
          px: '300',
          py: '200',
        },
      },
    },
  },
  globalCss: {
    html: {
      colorScheme: 'light dark',
    },
    body: {
      bg: 'bg',
      color: 'fg',
      fontFamily: 'body',
      lineHeight: '1.6',
    },
    '*': {
      borderColor: 'border',
    },
    '*::placeholder': {
      color: 'fg.muted',
    },
  },
})

export const system = createSystem(defaultConfig, config)
