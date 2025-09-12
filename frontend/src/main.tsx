import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
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

// Setting up React 19 with enhanced error handling and Strict Mode
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
} else {
  const root = createRoot(rootElement);
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
}
