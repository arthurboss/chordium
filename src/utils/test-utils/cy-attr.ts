import { isTestMode } from './is-test-mode';

/**
 * For cypress-specific test attributes
 */
export function cyAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-cy': id } : {};
}
