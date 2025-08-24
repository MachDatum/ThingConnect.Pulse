import { Provider } from '@/components/ui/provider';
import { QueryProvider } from '@/providers/QueryProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <Provider>
        <App />
      </Provider>
    </QueryProvider>
  </StrictMode>
);
