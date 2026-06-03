import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';

// Register service worker — needed in dev too so push notifications can be tested locally.
// The SW only caches public assets (no JS chunks), so HMR is unaffected.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[sw] registration failed:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', background: '#111827', color: '#fff', fontSize: '14px' },
              success: {
                duration: 3500,
                iconTheme: { primary: '#16a34a', secondary: '#fff' },
              },
              error: {
                duration: 5000,
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
