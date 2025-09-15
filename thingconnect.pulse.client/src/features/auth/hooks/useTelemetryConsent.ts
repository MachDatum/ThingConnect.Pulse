import { useState, useCallback } from 'react';

export interface TelemetryConsentRequest {
  errorDiagnostics: boolean;
  usageAnalytics: boolean;
}

export interface TelemetryConsentResponse {
  errorDiagnostics: boolean;
  usageAnalytics: boolean;
}

export function useTelemetryConsent() {
  const [isLoading, setIsLoading] = useState(false);

  const saveTelemetryConsent = useCallback(async (consent: TelemetryConsentRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/telemetry-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorDiagnostics: consent.errorDiagnostics,
          usageAnalytics: consent.usageAnalytics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save telemetry consent');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTelemetryConsent = useCallback(async (): Promise<TelemetryConsentResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/telemetry-consent');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get telemetry consent');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveTelemetryConsent,
    getTelemetryConsent,
    isLoading,
  };
}