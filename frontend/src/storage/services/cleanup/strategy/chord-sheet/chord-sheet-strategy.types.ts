export type { CleanupStrategy } from '../types';

/**
 * Result of access frequency calculation for cleanup priority
 */
export interface AccessFrequencyResult {
  /** Priority bonus points based on access frequency */
  priority: number;
  /** Human-readable reason for the frequency bonus */
  reason: string;
}
