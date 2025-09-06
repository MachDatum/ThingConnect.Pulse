import { Provider } from '@/components/ui/provider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

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
