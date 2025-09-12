// Utility to get the correct API base URL for frontend requests
// - In development: use relative URLs (so Vite proxy works for LAN/devices)
// - In production/preview: use VITE_API_URL (or fallback to hardcoded URL)

export function getApiBaseUrl(): string {
  // Get the API URL from environment variables first
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Debug logging for production troubleshooting
  console.log('[DEBUG] API Base URL Debug Info:', {
    'import.meta.env.VITE_API_URL': apiUrl,
    'import.meta.env.DEV': import.meta.env.DEV,
    'import.meta.env.PROD': import.meta.env.PROD,
    'import.meta.env.MODE': import.meta.env.MODE,
    'window.location.hostname': typeof window !== 'undefined' ? window.location.hostname : 'server-side'
  });
  
  // If VITE_API_URL is set, always use it (production, preview, or dev override)
  if (apiUrl) {
    console.log('[DEBUG] Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // In development mode with no VITE_API_URL set, use relative URLs for proxy
  if (import.meta.env.DEV) {
    console.log('[DEBUG] Development mode - using relative URLs for proxy');
    return '';
  }
  
  // Fallback for production builds without VITE_API_URL
  if (!import.meta.env.DEV) {
    console.warn('[API] VITE_API_URL not set! Using hardcoded fallback.');
  }
  console.log('[DEBUG] Using fallback URL: https://chordium-backend.onrender.com');
  return 'https://chordium-backend.onrender.com';
} 