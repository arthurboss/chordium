/**
 * Cleanup strategy result interface
 */

/** Cleanup strategy result */
export interface CleanupStrategy {
  /** Priority score - higher means keep longer (1000 = never remove) */
  priority: number;
  /** Human-readable reason for the priority */
  reason: string;
  /** Whether item can be safely removed */
  canRemove: boolean;
}
