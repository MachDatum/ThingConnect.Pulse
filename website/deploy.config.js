/**
 * Deployment configuration for ThingConnect Pulse documentation
 * This file configures various deployment targets and options
 */

module.exports = {
  // GitHub Pages deployment
  githubPages: {
    enabled: true,
    branch: 'gh-pages',
    cname: 'docs.thingconnect.io', // Custom domain (optional)
    trailingSlash: false,
    organizationName: 'MachDatum',
    projectName: 'ThingConnect.Pulse',
  },

  // Netlify deployment
  netlify: {
    enabled: false, // Set to true to enable Netlify deployment
    siteId: process.env.NETLIFY_SITE_ID,
    buildDir: 'build',
    redirects: [
      {
        from: '/api/*',
        to: '/api/overview',
        status: 302
      },
      {
        from: '/docs/*',
        to: '/',
        status: 302
      }
    ],
    headers: [
      {
        for: '/*',
        values: {
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      {
        for: '/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    ]
  },

  // Vercel deployment
  vercel: {
    enabled: false,
    buildCommand: 'npm run build',
    outputDirectory: 'build',
    installCommand: 'npm ci',
    devCommand: 'npm start',
    framework: 'docusaurus-2'
  },

  // AWS S3 + CloudFront deployment
  aws: {
    enabled: false,
    s3: {
      bucket: 'thingconnect-pulse-docs',
      region: 'us-east-1',
      cloudFrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID
    }
  },

  // Build optimization
  build: {
    // Minification options
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true
    },

    // Bundle analyzer
    analyzer: process.env.ANALYZE === 'true',

    // Source maps for production debugging
    sourceMaps: process.env.NODE_ENV !== 'production',

    // Compression
    compression: {
      gzip: true,
      brotli: true
    }
  },

  // SEO and social media
  seo: {
    canonical: 'https://docs.thingconnect.io/pulse/',
    
    // Social media tags
    social: {
      twitterCard: 'summary_large_image',
      twitterSite: '@thingconnect',
      ogType: 'website',
      ogImage: 'img/thingconnect-social-card.jpg'
    },

    // Search engine optimization
    robots: 'index,follow',
    sitemap: true,
    
    // Analytics
    analytics: {
      googleAnalytics: process.env.GA_TRACKING_ID,
      googleTagManager: process.env.GTM_ID,
      hotjar: process.env.HOTJAR_ID
    }
  },

  // Security headers and policies
  security: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Docusaurus
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Docusaurus
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:'
      ],
      'connect-src': [
        "'self'",
        'https://www.google-analytics.com'
      ]
    },

    // Feature policy
    featurePolicy: {
      camera: "'none'",
      microphone: "'none'",
      geolocation: "'none'",
      payment: "'none'"
    }
  },

  // Performance monitoring
  performance: {
    // Lighthouse CI configuration
    lighthouse: {
      collect: {
        numberOfRuns: 3
      },
      assert: {
        assertions: {
          'categories:performance': ['warn', { minScore: 0.9 }],
          'categories:accessibility': ['error', { minScore: 0.95 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.95 }]
        }
      },
      upload: {
        target: 'temporary-public-storage'
      }
    },

    // Bundle size monitoring
    bundleAnalyzer: {
      enabled: process.env.ANALYZE_BUNDLE === 'true',
      reportFilename: '../docs-bundle-report.html'
    }
  },

  // Internationalization (future)
  i18n: {
    enabled: false,
    defaultLocale: 'en',
    locales: ['en'], // Add more locales as needed: ['en', 'es', 'fr', 'de']
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr'
      }
    }
  },

  // Development server
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    poll: false
  },

  // Monitoring and alerts
  monitoring: {
    // Uptime monitoring
    uptimeRobot: {
      enabled: false,
      apiKey: process.env.UPTIMEROBOT_API_KEY,
      monitorUrl: 'https://docs.thingconnect.io/pulse/'
    },

    // Error tracking
    sentry: {
      enabled: false,
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development'
    },

    // Real user monitoring
    newRelic: {
      enabled: false,
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
      accountId: process.env.NEW_RELIC_ACCOUNT_ID
    }
  }
};