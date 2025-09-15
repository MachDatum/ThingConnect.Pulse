import mixpanel from 'mixpanel-browser';

export interface AnalyticsService {
  track(eventName: string, properties?: Record<string, unknown>): void;
  identify(userId: string): void;
  reset(): void;
  isInitialized(): boolean;
}

export interface InitializableAnalyticsService extends AnalyticsService {
  init(): void;
}

class PrivacyFirstAnalyticsService implements InitializableAnalyticsService {
  private initialized = false;
  private readonly mixpanelToken = '762f09fce9fe2be51b04b8f38e47c87a';

  public init(): void {
    if (this.initialized) return;

    try {
      mixpanel.init(this.mixpanelToken, {
        // Privacy-first configuration
        opt_out_tracking_by_default: true,
        ip: false, // Don't collect IP addresses
        disable_persistence: false, // Enable for user session tracking
        
        // Additional privacy settings
        property_blacklist: [
          '$email', '$phone', '$name', '$first_name', '$last_name',
          'email', 'phone', 'name', 'firstName', 'lastName'
        ],
        
        // Disable automatic tracking
        track_pageview: false,
        track_links_timeout: 300,
        
        // Security settings
        secure_cookie: true,
        upgrade: true,
        
        // Debug mode - disable in production
        debug: process.env.NODE_ENV === 'development'
      });

      // Opt in to tracking since user has explicitly consented
      mixpanel.opt_in_tracking();
      
      this.initialized = true;
      console.log('Analytics initialized with user consent for usage analytics');
    } catch (error) {
      console.warn('Failed to initialize analytics:', error);
    }
  }

  public track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.initialized) return;

    try {
      // Sanitize properties to remove any potential PII
      const sanitizedProperties = this.sanitizeProperties(properties || {});
      
      mixpanel.track(eventName, {
        ...sanitizedProperties,
        // Add standard non-PII context
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Manufacturing monitoring context
        app_version: '1.0', // Could be dynamic
        deployment_type: 'on_premise'
      });
    } catch (error) {
      console.warn('Failed to track event:', eventName, error);
    }
  }

  public identify(userId: string): void {
    if (!this.initialized) return;

    try {
      // Use hashed/anonymized user ID
      const anonymizedId = this.hashUserId(userId);
      mixpanel.identify(anonymizedId);
    } catch (error) {
      console.warn('Failed to identify user:', error);
    }
  }

  public reset(): void {
    if (!this.initialized) return;

    try {
      mixpanel.reset();
    } catch (error) {
      console.warn('Failed to reset analytics:', error);
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private sanitizeProperties(properties: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    const sensitiveKeys = [
      'email', 'password', 'token', 'key', 'secret', 'auth',
      'phone', 'address', 'ip', 'name', 'username', 'user'
    ];

    for (const [key, value] of Object.entries(properties)) {
      const lowerKey = key.toLowerCase();
      
      // Skip sensitive keys
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        continue;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        // Remove email patterns
        sanitized[key] = value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
        // Remove IP patterns
        sanitized[key] = (sanitized[key] as string).replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private hashUserId(userId: string): string {
    // Simple hash for anonymization - could use crypto.subtle.digest in production
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash)}`;
  }
}

// No-op implementation when consent is not granted
class NoOpAnalyticsService implements AnalyticsService {
  public track(): void {
    // No-op
  }

  public identify(): void {
    // No-op
  }

  public reset(): void {
    // No-op
  }

  public isInitialized(): boolean {
    return false;
  }
}

// Export singleton instances
export const analytics: AnalyticsService = new NoOpAnalyticsService();
export const privacyFirstAnalytics: InitializableAnalyticsService = new PrivacyFirstAnalyticsService();