import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { StoreProvider } from './store';
import { initAntiCloneProtection } from './utils/antiCloneGuard';
import './index.css';

// Activate Anti-Clone Domain Lock & Copy Protection before rendering
initAntiCloneProtection();

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    release: 'v3.8.1-LOCK',
    environment: import.meta.env.MODE || 'production',
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
