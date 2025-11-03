import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed to a named import to match the export from App.tsx.
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Wrapped App component within ErrorBoundary to provide the required 'children' prop and fix the render error. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);