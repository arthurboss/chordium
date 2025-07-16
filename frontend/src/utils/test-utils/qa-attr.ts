import { isTestMode } from './is-test-mode';

/**
 * For general test attributes
 */
export function qaAttr(id: string): Record<string, string> {
  return isTestMode() ? { 'data-qa': id } : {};
}
