import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.chordium",
  appName: "Chordium",
  webDir: "frontend/dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    // API routes do not send CORS headers for the local Capacitor origin, so
    // requests go through the native bridge instead of the WebView.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
