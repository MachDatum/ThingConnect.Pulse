import { Provider } from '@/components/ui/provider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// NOTE: Sentry initialization moved to useSentryConsentInit hook
// This ensures Sentry is only initialized after authentication and with explicit consent

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <Provider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </QueryProvider>
  </StrictMode>
);
