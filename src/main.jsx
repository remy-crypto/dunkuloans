import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import * as Sentry from "@sentry/react";

// --- SENTRY INITIALIZATION ---
Sentry.init({
  dsn: "https://cd6ba3bf2790c9b9ec9fb4eb8347c491@o4510453544910848.ingest.de.sentry.io/4510522200031312",
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for debugging
  
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Sentry Error Boundary catches crashes and shows a fallback UI instead of a white screen */}
    <Sentry.ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-gray-400">Our engineering team has been notified.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700">
            Reload Page
          </button>
        </div>
      </div>
    }>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);