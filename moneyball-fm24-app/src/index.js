import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { validateBrowserCompatibility, logError, getSystemInfo } from './utils/errorHandling';

// Check browser compatibility before starting the app
const compatibilityError = validateBrowserCompatibility();
if (compatibilityError) {
  // Show compatibility error
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        max-width: 600px;
        background: white;
        border-radius: 1rem;
        padding: 3rem;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="font-size: 4rem; margin-bottom: 1.5rem;">⚠️</div>
        <h1 style="
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        ">
          Browser Not Supported
        </h1>
        <p style="
          font-size: 1.125rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        ">
          Moneyball: FM requires a modern web browser with support for WebAssembly 
          and other advanced features to run the in-browser Python processing.
        </p>
        <div style="
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: left;
        ">
          <h3 style="
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 0.5rem;
          ">
            Recommended Browsers:
          </h3>
          <ul style="
            color: #7f1d1d;
            font-size: 0.875rem;
            list-style: disc;
            margin-left: 1.5rem;
          ">
            <li>Google Chrome 70+</li>
            <li>Mozilla Firefox 65+</li>
            <li>Safari 14+</li>
            <li>Microsoft Edge 79+</li>
          </ul>
        </div>
        <button onclick="window.location.reload()" style="
          background: #dc2626;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
          Try Again
        </button>
      </div>
    </div>
  `;
  
  logError(compatibilityError, { systemInfo: getSystemInfo() });
  throw new Error('Browser compatibility check failed');
}

// Initialize the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  logError(event.reason, { type: 'unhandledrejection' });
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  logError(event.error, { 
    type: 'globalerror', 
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno 
  });
});

// Render the app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'production') {
  // Log performance metrics
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('App Load Performance:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          totalLoadTime: perfData.loadEventEnd - perfData.navigationStart,
          domInteractive: perfData.domInteractive - perfData.navigationStart
        });
      }
    }
  });
}

// Service Worker registration (optional for PWA features)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}