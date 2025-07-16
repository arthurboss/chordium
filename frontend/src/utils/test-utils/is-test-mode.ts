/**
 * Determines if the application is running in test mode
 * In production builds, this will always return false
 * In development and test environments, this will return true
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}
