// Ensure window.fetch is safely assignable in iframe/sandbox environments
if (typeof window !== 'undefined' && window.fetch) {
  try {
    let currentFetch = window.fetch.bind(window);
    let isWritable = false;
    try {
      (window as any).fetch = currentFetch;
      isWritable = true;
    } catch {
      isWritable = false;
    }
    if (!isWritable) {
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (fn) => {
          if (typeof fn === 'function') currentFetch = fn;
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch {}
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Auto-redirect from standard paths to HashRouter paths (e.g. /admin/login -> /#/admin/login)
if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/index.html' && !window.location.hash) {
  const path = window.location.pathname;
  const search = window.location.search;
  window.location.replace(`${window.location.origin}/#${path}${search}`);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);