import { isTestMode } from './is-test-mode';

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
