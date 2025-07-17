// Utility to get the correct API base URL for frontend requests
// - In development: use relative URLs (so Vite proxy works for LAN/devices)
// - In production: use VITE_API_URL (or fallback to relative)

export function getApiBaseUrl(): string {
  // Vite exposes import.meta.env.DEV and import.meta.env.PROD
  if (import.meta.env.DEV) {
    // Use relative URLs in dev so Vite proxy works
    return '';
  }
  // In production, use VITE_API_URL if set, else relative
  return import.meta.env.VITE_API_URL || '';
} 