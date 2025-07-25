// Utility to get the correct API base URL for frontend requests
// - In development: use relative URLs (so Vite proxy works for LAN/devices)
// - In production/preview: use VITE_API_URL (or fallback to hardcoded URL)

export function getApiBaseUrl(): string {
  // Get the API URL from environment variables first
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is set, always use it (production, preview, or dev override)
  if (apiUrl) {
    return apiUrl;
  }
  
  // In development mode with no VITE_API_URL set, use relative URLs for proxy
  if (import.meta.env.DEV) {
    return '';
  }
  
  // Fallback for production builds without VITE_API_URL
  console.warn('[API] VITE_API_URL not set! Using hardcoded fallback.');
  return 'https://chordium-backend.onrender.com';
} 