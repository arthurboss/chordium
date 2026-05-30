import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import i18n from "./i18n/config";

// Service worker registration is handled by VitePWA plugin

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

i18n.init().then(() => {
  if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, <App />);
  } else {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});
