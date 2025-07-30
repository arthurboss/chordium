/**
 * Types for cleanup strategy priority calculations
 */

/**
 * Result of priority calculation for cleanup operations
 */
export interface PriorityResult {
  /** Priority bonus points */
  priority: number;
  /** Human-readable reason for the priority value */
  reason: string;
}
