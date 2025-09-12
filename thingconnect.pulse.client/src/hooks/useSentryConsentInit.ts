import { useEffect, useState } from 'react';
import * as Sentry from "@sentry/react";

let sentryInitialized = false;

export function useSentryConsentInit(isAuthenticated: boolean) {
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  useEffect(() => {
    const initializeSentryIfConsented = async () => {
      // Only attempt initialization once and when user is authenticated
      if (!isAuthenticated || initializationAttempted || sentryInitialized) {
        return;
      }

      setInitializationAttempted(true);

      try {
        // Check if user has consented to error diagnostics
        const consentResponse = await fetch('/api/auth/telemetry-consent', {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (consentResponse.ok) {
          const consent = await consentResponse.json() as { errorDiagnostics: boolean; usageAnalytics: boolean };
          
          if (consent.errorDiagnostics) {
            Sentry.init({
              dsn: "https://1e36ffba4c74feac5eef427eed9ffeca@o349349.ingest.us.sentry.io/4510005218443264",
              // Privacy-first configuration: no PII data collection
              sendDefaultPii: false,
              beforeSend(event) {
                // Additional privacy filtering - remove any potential PII
                if (event.user) {
                  delete event.user.ip_address;
                  delete event.user.email;
                }
                return event;
              }
            });
            
            sentryInitialized = true;
            console.log('Sentry initialized with user consent for error diagnostics');
          } else {
            console.log('Sentry not initialized - user has not consented to error diagnostics');
          }
        } else {
          console.log('Sentry not initialized - could not verify consent');
        }
      } catch (error) {
        console.log('Sentry initialization skipped - consent verification failed:', error);
      }
    };

    void initializeSentryIfConsented();
  }, [isAuthenticated, initializationAttempted]);

  return { sentryInitialized };
}