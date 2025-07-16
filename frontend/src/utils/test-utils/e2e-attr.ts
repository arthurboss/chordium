import { isTestMode } from './is-test-mode';

/**
 * For e2e test attributes
 */
export function e2eAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-e2e': id } : {};
}
