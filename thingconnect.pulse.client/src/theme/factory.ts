import { createSystem, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    tokens: {
      spacing: {
        xs: { value: '4px' },   // Base unit
        sm: { value: '8px' },
        md: { value: '16px' },
        lg: { value: '24px' },
        xl: { value: '32px' },
        '2xl': { value: '40px' },
        '3xl': { value: '48px' },
      },
      sizes: {
        controlSm: { value: '32px' },
        controlMd: { value: '36px' },
        controlLg: { value: '40px' },
        pageHeaderSm: { value: '40px' },
        pageHeader: { value: '48px' },
      },
      fontSizes: {
        body: { value: '14px' },
        bodyLg: { value: '16px' },
        title: { value: '18px' },
        titleLg: { value: '24px' },
      },
      colors: {
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#3b82f6' },
          600: { value: '#2563eb' },
          700: { value: '#1d4ed8' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' },
        },
      },
    },
    semanticTokens: {
      colors: {
        // Text colors
        text: {
          DEFAULT: { value: '{colors.gray.900}' },
          muted: { value: '{colors.gray.600}' },
          disabled: { value: '{colors.gray.400}' },
          _dark: {
            DEFAULT: { value: '{colors.gray.100}' },
            muted: { value: '{colors.gray.400}' },
            disabled: { value: '{colors.gray.600}' },
          },
        },
        // Background colors
        bg: {
          DEFAULT: { value: '{colors.white}' },
          elevated: { value: '{colors.gray.50}' },
          _dark: {
            DEFAULT: { value: '{colors.gray.900}' },
            elevated: { value: '{colors.gray.800}' },
          },
        },
        // Border colors
        border: {
          DEFAULT: { value: '{colors.gray.200}' },
          muted: { value: '{colors.gray.100}' },
          _dark: {
            DEFAULT: { value: '{colors.gray.700}' },
            muted: { value: '{colors.gray.800}' },
          },
        },
        // Status colors (semantic only)
        status: {
          success: { value: '{colors.green.500}' },
          warning: { value: '{colors.yellow.500}' },
          danger: { value: '{colors.red.500}' },
          info: { value: '{colors.blue.500}' },
        },
      },
    },
    textStyles: {
      body: {
        value: {
          fontSize: 'body',
          lineHeight: '1.4',
          fontWeight: 'normal',
        },
      },
      bodyLarge: {
        value: {
          fontSize: 'bodyLg',
          lineHeight: '1.4',
          fontWeight: 'normal',
        },
      },
      title: {
        value: {
          fontSize: 'title',
          lineHeight: '1.3',
          fontWeight: 'semibold',
          color: 'brand.600',
        },
      },
      titleLarge: {
        value: {
          fontSize: 'titleLg',
          lineHeight: '1.2',
          fontWeight: 'semibold',
          color: 'brand.600',
        },
      },
    },
  },
  globalCss: {
    body: {
      fontSize: 'body',
      lineHeight: '1.4',
      color: 'text',
      bg: 'bg',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontWeight: 'semibold',
      lineHeight: 'shorter',
    },
  },
});

export const factorySystem = createSystem(config);