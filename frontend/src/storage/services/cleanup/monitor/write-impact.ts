/**
 * Write operation impact estimation
 */

import { LIMITS } from '../../../core/ttl/limits';
import { getCurrentUsage } from './usage';

/**
 * Estimates if adding new data would exceed limits
 */
export async function wouldExceedAfterWrite(estimatedSize: number = 50000): Promise<boolean> {
  const usage = await getCurrentUsage();
  const afterWrite = usage.usage + estimatedSize;
  return (afterWrite / LIMITS.TOTAL_STORAGE_TARGET) > LIMITS.CLEANUP_THRESHOLD;
}
