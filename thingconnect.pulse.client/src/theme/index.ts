import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Atlassian brand colors - primary blue palette (B400 = #0052CC)
        brand: {
          50: { value: "#e6f2ff" },
          100: { value: "#cce6ff" },
          200: { value: "#99ccff" },
          300: { value: "#66b3ff" },
          400: { value: "#0052cc" },  // Atlassian primary blue (B400)
          500: { value: "#0052cc" },  // Atlassian primary blue (B400)
          600: { value: "#0046b3" },
          700: { value: "#003a99" },
          800: { value: "#002e80" },
          900: { value: "#002266" },
          950: { value: "#001a4d" },
        },
        // Atlassian neutral surfaces - clean whites and dark backgrounds
        surfaceDefault: { 
          50: { value: "#ffffff" },   // Atlassian white (N0)
          900: { value: "#091e42" }   // Atlassian dark blue (N900)
        },
        surfaceSunken: { 
          50: { value: "#f4f5f7" },   // Atlassian light gray (N20)
          900: { value: "#0c2140" }   // Atlassian darker blue
        },
        surfaceRaised: { 
          50: { value: "#ffffff" },   // Atlassian white (N0)
          900: { value: "#172b4d" }   // Atlassian neutral text (N800)
        },
        surfaceOverlay: { 
          50: { value: "#ffffff" },   // Atlassian white (N0)
          900: { value: "#253858" }   // Atlassian modal overlay
        },
        // Atlassian teal/secondary colors (T300 = #00B8D9)
        accent: {
          50: { value: "#e6fcff" },
          100: { value: "#ccf9ff" },
          200: { value: "#99f2ff" },
          300: { value: "#66ebff" },
          400: { value: "#33e4ff" },
          500: { value: "#00b8d9" },  // Atlassian teal (T300)
          600: { value: "#00a3c7" },
          700: { value: "#008fb5" },
          800: { value: "#007ba3" },
          900: { value: "#006691" },
          950: { value: "#00527f" },
        },
        // Atlassian neutral grays (N800 = #172B4D for text)
        neutral: {
          50: { value: "#fafbfc" },   // Atlassian light (N10)
          100: { value: "#f4f5f7" },  // Atlassian light gray (N20)
          200: { value: "#ebecf0" },  // Atlassian border (N40)
          300: { value: "#dfe1e6" },  // Atlassian subtle (N60)
          400: { value: "#97a0af" },  // Atlassian muted (N200)
          500: { value: "#6b778c" },  // Atlassian secondary (N300)
          600: { value: "#505f79" },  // Atlassian primary text (N500)
          700: { value: "#42526e" },  // Atlassian darker text (N600)
          800: { value: "#172b4d" },  // Atlassian text dark (N800)
          900: { value: "#091e42" },  // Atlassian darkest (N900)
          950: { value: "#061b35" },  // Atlassian deep dark
        },
        // Atlassian success colors (G300 = #36B37E)
        success: {
          50: { value: "#e3fcef" },
          100: { value: "#c7f9df" },
          200: { value: "#8ff2bf" },
          300: { value: "#57eb9f" },
          400: { value: "#36b37e" },  // Atlassian green (G300)
          500: { value: "#36b37e" },  // Atlassian green (G300)
          600: { value: "#2e9f6b" },
          700: { value: "#268b58" },
          800: { value: "#1e7745" },
          900: { value: "#166332" },
          950: { value: "#0e4f1f" },
        },
        // Atlassian warning colors (Y300 = #FFAB00)
        warning: {
          50: { value: "#fff8e6" },
          100: { value: "#fff0cc" },
          200: { value: "#ffe199" },
          300: { value: "#ffd266" },
          400: { value: "#ffc333" },
          500: { value: "#ffab00" },  // Atlassian yellow (Y300)
          600: { value: "#e6970e" },
          700: { value: "#cc831c" },
          800: { value: "#b36f2a" },
          900: { value: "#995b38" },
          950: { value: "#804746" },
        },
        // Atlassian error/danger colors (R300 = #FF5630)
        danger: {
          50: { value: "#ffebe6" },
          100: { value: "#ffd6cc" },
          200: { value: "#ffad99" },
          300: { value: "#ff8566" },
          400: { value: "#ff5c33" },
          500: { value: "#ff5630" },  // Atlassian red (R300)
          600: { value: "#e64a2b" },
          700: { value: "#cc3e26" },
          800: { value: "#b33221" },
          900: { value: "#99261c" },
          950: { value: "#801a17" },
        },
      },
      fonts: {
        heading: { value: "'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
        body: { value: "'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
        mono: { value: "SF Mono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
      },
      fontSizes: {
        "2xs": { value: "0.625rem" }, // 10px
        xs: { value: "0.75rem" },    // 12px
        sm: { value: "0.875rem" },   // 14px
        md: { value: "1rem" },       // 16px
        lg: { value: "1.125rem" },   // 18px
        xl: { value: "1.25rem" },    // 20px
        "2xl": { value: "1.5rem" },  // 24px
        "3xl": { value: "1.875rem" }, // 30px
        "4xl": { value: "2.25rem" },  // 36px
        "5xl": { value: "3rem" },     // 48px
        "6xl": { value: "3.75rem" },  // 60px
        "7xl": { value: "4.5rem" },   // 72px
      },
      spacing: {
        // Atlassian Design System 4px grid spacing tokens
        "025": { value: "0.125rem" }, // 2px - minimal spacing
        "050": { value: "0.25rem" },  // 4px - space.050
        "075": { value: "0.375rem" }, // 6px - space.075
        "100": { value: "0.5rem" },   // 8px - space.100
        "150": { value: "0.75rem" },  // 12px - space.150
        "200": { value: "1rem" },     // 16px - space.200
        "250": { value: "1.25rem" },  // 20px - space.250
        "300": { value: "1.5rem" },   // 24px - space.300
        "400": { value: "2rem" },     // 32px - space.400
        "500": { value: "2.5rem" },   // 40px - space.500
        "600": { value: "3rem" },     // 48px - space.600
        "800": { value: "4rem" },     // 64px - space.800
        "1000": { value: "5rem" },    // 80px - space.1000
      },
      radii: {
        none: { value: "0" },
        sm: { value: "0.125rem" },    // 2px
        base: { value: "0.1875rem" }, // 3px - Atlassian button border radius
        md: { value: "0.25rem" },     // 4px
        lg: { value: "0.375rem" },    // 6px
        xl: { value: "0.5rem" },      // 8px
        "2xl": { value: "0.75rem" },  // 12px
        "3xl": { value: "1rem" },     // 16px
        full: { value: "9999px" },
      },
      shadows: {
        // Atlassian-inspired shadow system - subtle and clean
        raised: { value: "0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
        overlay: { value: "0 8px 16px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
        "raised.dark": { value: "0 1px 1px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.31)" },
        "overlay.dark": { value: "0 8px 16px rgba(0, 0, 0, 0.36), 0 0 1px rgba(0, 0, 0, 0.31)" },
        // Atlassian elevation shadows
        xs: { value: "0 1px 1px rgba(9, 30, 66, 0.25)" },
        sm: { value: "0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
        base: { value: "0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
        md: { value: "0 8px 16px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
        lg: { value: "0 16px 24px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)" },
      },
      gradients: {
        // Atlassian subtle gradients for overlays and backgrounds
        "brand.subtle": { value: "linear-gradient(135deg, #0052cc 0%, #0065ff 100%)" },
        "accent.subtle": { value: "linear-gradient(135deg, #00b8d9 0%, #36b37e 100%)" },
        "surface.overlay": { value: "linear-gradient(rgba(9, 30, 66, 0), rgba(9, 30, 66, 0.6))" },
        "surface.overlay.light": { value: "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9))" },
      },
    },
    semanticTokens: {
      colors: {
        // ThingConnect brand semantic tokens
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.brand.600}", 
              _dark: "{colors.brand.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.brand.50}", 
              _dark: "{colors.brand.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.brand.100}", 
              _dark: "{colors.brand.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.brand.200}", 
              _dark: "{colors.brand.800}" 
            } 
          },
          focusRing: { value: "{colors.brand.500}" },
        },
        // ThingConnect accent/secondary semantic tokens
        accent: {
          solid: { value: "{colors.accent.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.accent.600}", 
              _dark: "{colors.accent.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.accent.50}", 
              _dark: "{colors.accent.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.accent.100}", 
              _dark: "{colors.accent.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.accent.200}", 
              _dark: "{colors.accent.800}" 
            } 
          },
          focusRing: { value: "{colors.accent.500}" },
        },
        // Success semantic tokens
        success: {
          solid: { value: "{colors.success.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.success.600}", 
              _dark: "{colors.success.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.success.50}", 
              _dark: "{colors.success.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.success.100}", 
              _dark: "{colors.success.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.success.200}", 
              _dark: "{colors.success.800}" 
            } 
          },
          focusRing: { value: "{colors.success.500}" },
        },
        // Warning semantic tokens
        warning: {
          solid: { value: "{colors.warning.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.warning.600}", 
              _dark: "{colors.warning.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.warning.50}", 
              _dark: "{colors.warning.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.warning.100}", 
              _dark: "{colors.warning.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.warning.200}", 
              _dark: "{colors.warning.800}" 
            } 
          },
          focusRing: { value: "{colors.warning.500}" },
        },
        // Danger semantic tokens
        danger: {
          solid: { value: "{colors.danger.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.danger.600}", 
              _dark: "{colors.danger.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.danger.50}", 
              _dark: "{colors.danger.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.danger.100}", 
              _dark: "{colors.danger.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.danger.200}", 
              _dark: "{colors.danger.800}" 
            } 
          },
          focusRing: { value: "{colors.danger.500}" },
        },
        // Neutral semantic tokens
        neutral: {
          solid: { value: "{colors.neutral.500}" },
          contrast: { value: "white" },
          fg: { 
            value: { 
              _light: "{colors.neutral.600}", 
              _dark: "{colors.neutral.400}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.neutral.50}", 
              _dark: "{colors.neutral.950}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.neutral.100}", 
              _dark: "{colors.neutral.900}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.neutral.200}", 
              _dark: "{colors.neutral.800}" 
            } 
          },
          focusRing: { value: "{colors.neutral.500}" },
        },
        // Atlassian-style surface semantic tokens
        "color.background.default": {
          value: {
            _light: "{colors.surfaceDefault.50}",
            _dark: "{colors.surfaceDefault.900}"
          }
        },
        "color.background.sunken": {
          value: {
            _light: "{colors.surfaceSunken.50}",
            _dark: "{colors.surfaceSunken.900}"
          }
        },
        "color.background.raised": {
          value: {
            _light: "{colors.surfaceRaised.50}",
            _dark: "{colors.surfaceRaised.900}"
          }
        },
        "color.background.overlay": {
          value: {
            _light: "{colors.surfaceOverlay.50}",
            _dark: "{colors.surfaceOverlay.900}"
          }
        },
        // Legacy background tokens for compatibility
        bg: {
          value: {
            _light: "{colors.surfaceSunken.50}",
            _dark: "{colors.surfaceSunken.900}"
          }
        },
        "bg.panel": {
          value: {
            _light: "{colors.surfaceDefault.50}",
            _dark: "{colors.surfaceDefault.900}"
          }
        },
        fg: {
          value: {
            _light: "{colors.neutral.900}",
            _dark: "{colors.neutral.100}"
          }
        },
        "fg.muted": {
          value: {
            _light: "{colors.neutral.600}",
            _dark: "{colors.neutral.400}"
          }
        },
        "fg.subtle": {
          value: {
            _light: "{colors.neutral.500}",
            _dark: "{colors.neutral.500}"
          }
        },
        border: {
          value: {
            _light: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}"
          }
        },
        "border.muted": {
          value: {
            _light: "{colors.neutral.100}",
            _dark: "{colors.neutral.800}"
          }
        },
        "border.subtle": {
          value: {
            _light: "{colors.neutral.300}",
            _dark: "{colors.neutral.600}"
          }
        },
      },
    },
    textStyles: {
      // Atlassian typography scale - clean, accessible typography
      "ui.heading.xxlarge": {
        value: {
          fontSize: "7xl", // 72px
          fontWeight: "600", // Atlassian medium weight
          lineHeight: "1.125",
          letterSpacing: "-0.01em",
        },
      },
      "ui.heading.xlarge": {
        value: {
          fontSize: "6xl", // 60px
          fontWeight: "600",
          lineHeight: "1.133",
          letterSpacing: "-0.008em",
        },
      },
      "ui.heading.large": {
        value: {
          fontSize: "5xl", // 48px
          fontWeight: "600",
          lineHeight: "1.167",
          letterSpacing: "-0.006em",
        },
      },
      "ui.heading.medium": {
        value: {
          fontSize: "4xl", // 36px
          fontWeight: "500", // Atlassian medium
          lineHeight: "1.222",
          letterSpacing: "-0.004em",
        },
      },
      "ui.heading.small": {
        value: {
          fontSize: "3xl", // 30px
          fontWeight: "500",
          lineHeight: "1.267",
          letterSpacing: "-0.002em",
        },
      },
      "ui.heading.xsmall": {
        value: {
          fontSize: "2xl", // 24px
          fontWeight: "500",
          lineHeight: "1.333",
        },
      },
      "ui.heading.xxsmall": {
        value: {
          fontSize: "xl", // 20px
          fontWeight: "500",
          lineHeight: "1.4",
        },
      },
      // Atlassian body text styles - optimized for readability
      "ui.body.large": {
        value: {
          fontSize: "lg", // 18px
          fontWeight: "400",
          lineHeight: "1.556", // ~28px line height
        },
      },
      "ui.body.medium": {
        value: {
          fontSize: "md", // 16px
          fontWeight: "400",
          lineHeight: "1.5", // 24px line height
        },
      },
      "ui.body.small": {
        value: {
          fontSize: "sm", // 14px
          fontWeight: "400",
          lineHeight: "1.429", // ~20px line height
        },
      },
      // Helper text styles
      "ui.helper": {
        value: {
          fontSize: "xs", // 12px
          fontWeight: "400",
          lineHeight: "1.333", // 16px line height
        },
      },
      // Code text style
      "ui.code": {
        value: {
          fontSize: "sm", // 14px
          fontWeight: "400",
          lineHeight: "1.571", // ~22px
          fontFamily: "mono",
        },
      },
    },
    layerStyles: {
      // Atlassian surface styles - clean and accessible
      "atlassian.card": {
        value: {
          bg: "color.background.raised",
          borderRadius: "base", // 3px - Atlassian border radius
          border: "1px solid",
          borderColor: "border.muted",
          boxShadow: "raised",
          p: "200", // 16px - consistent spacing
        },
      },
      "atlassian.panel": {
        value: {
          bg: "color.background.sunken",
          borderRadius: "base",
          border: "1px solid",
          borderColor: "border.subtle",
          p: "300", // 24px
        },
      },
      "atlassian.header": {
        value: {
          bg: "color.background.default",
          borderBottom: "1px solid",
          borderColor: "border.muted",
          px: "200", // 16px
          py: "150", // 12px
          minHeight: "44px", // Atlassian touch target
        },
      },
      "atlassian.modal": {
        value: {
          bg: "color.background.overlay",
          borderRadius: "lg", // Larger radius for modals
          boxShadow: "overlay",
          p: "300", // 24px
        },
      },
      "atlassian.button.primary": {
        value: {
          bg: "brand.500",
          color: "white",
          borderRadius: "base", // 3px
          px: "200", // 16px
          py: "100", // 8px
          minHeight: "32px", // Atlassian button height
        },
      },
      "atlassian.button.secondary": {
        value: {
          bg: "transparent",
          color: "brand.500",
          border: "1px solid",
          borderColor: "brand.500",
          borderRadius: "base", // 3px
          px: "200", // 16px
          py: "100", // 8px
          minHeight: "32px", // Atlassian button height
        },
      },
      // Legacy styles for backward compatibility
      "enterprise.card": {
        value: {
          bg: "color.background.raised",
          borderRadius: "base",
          boxShadow: "raised",
          p: "300",
        },
      },
      "enterprise.header": {
        value: {
          bg: "color.background.default",
          borderBottom: "1px solid",
          borderColor: "border",
          px: "300",
          py: "200",
        },
      },
    },
  },
  globalCss: {
    "html": {
      colorScheme: "light dark",
    },
    "body": {
      bg: "bg",
      color: "fg",
      fontFamily: "body",
      lineHeight: "1.6",
    },
    "*": {
      borderColor: "border",
    },
    "*::placeholder": {
      color: "fg.muted",
    },
  },
})

export const system = createSystem(defaultConfig, config)