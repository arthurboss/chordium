/**
 * Utility functions for managing test-only features in the application
 */

/**
 * Determines if the application is running in test mode
 * In production builds, this will always return false
 * In development and test environments, this will return true
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Returns an object with test attributes if in test mode, otherwise returns an empty object
 * This approach prevents test attributes from being included in production builds
 * 
 * Example usage:
 * ```
 * <button {...testAttr('submit-button')}>Submit</button>
 * ```
 * 
 * In dev/test: <button data-testid="submit-button">Submit</button>
 * In production: <button>Submit</button>
 */
export function testAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-testid': id } : {};
}

/**
 * For cypress-specific test attributes
 */
export function cyAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-cy': id } : {};
}

/**
 * For e2e test attributes
 */
export function e2eAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-e2e': id } : {};
}

/**
 * For general test attributes
 */
export function qaAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-qa': id } : {};
}
