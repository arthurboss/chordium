// Returns the Render backend URL for endpoints that still require Puppeteer.
// Falls back to VITE_API_URL (dev) or hardcoded Render URL (production fallback).
export function getRenderUrl(): string {
  return (
    import.meta.env.VITE_RENDER_URL ||
    import.meta.env.VITE_API_URL ||
    'https://chordium-backend.onrender.com'
  );
}
