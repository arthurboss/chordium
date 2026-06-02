// Utility to get the correct API base URL for frontend requests
// - In development: use VITE_API_URL if set, otherwise relative URLs (Vite proxy)
// - In production/preview: use VITE_API_URL if set, otherwise relative URLs (/api/* on same domain)

export function getApiBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl ?? '';
}
