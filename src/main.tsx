import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/cache-debug';

// Setting up React 19 with enhanced error handling and Strict Mode
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
