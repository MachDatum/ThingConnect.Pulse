import { useEffect, useState } from 'react';
import { analytics, privacyFirstAnalytics } from '../services/analytics.service';

let analyticsInitialized = false;
let currentAnalyticsService = analytics; // Start with no-op

export function useAnalyticsConsentInit(isAuthenticated: boolean) {
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  useEffect(() => {
    const initializeAnalyticsIfConsented = async () => {
      // Only attempt initialization once and when user is authenticated
      if (!isAuthenticated || initializationAttempted || analyticsInitialized) {
        return;
      }

      setInitializationAttempted(true);

      try {
        // Check if user has consented to usage analytics
        const consentResponse = await fetch('/api/auth/telemetry-consent', {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (consentResponse.ok) {
          const consent = await consentResponse.json() as { errorDiagnostics: boolean; usageAnalytics: boolean };
          
          if (consent.usageAnalytics) {
            // Initialize privacy-first analytics service
            privacyFirstAnalytics.init();
            currentAnalyticsService = privacyFirstAnalytics;
            analyticsInitialized = true;
            
            // Track initial session start
            currentAnalyticsService.track('Session Started', {
              authentication_method: 'web_login',
              platform: 'web',
              is_mobile: window.innerWidth < 768
            });

            console.log('Analytics initialized with user consent for usage analytics');
          } else {
            console.log('Analytics not initialized - user has not consented to usage analytics');
          }
        } else {
          console.log('Analytics not initialized - could not verify consent');
        }
      } catch (error) {
        console.log('Analytics initialization skipped - consent verification failed:', error);
      }
    };

    void initializeAnalyticsIfConsented();
  }, [isAuthenticated, initializationAttempted]);

  return { 
    analyticsInitialized,
    analytics: currentAnalyticsService
  };
}

// Export the current analytics service for use throughout the app
export const getAnalyticsService = () => currentAnalyticsService;