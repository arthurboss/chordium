/**
 * App startup cleanup trigger
 */

import { shouldTriggerCleanup } from '../monitor/threshold';

/**
 * Triggers cleanup on application start if needed
 */
export async function triggerOnAppStart(): Promise<boolean> {
  return await shouldTriggerCleanup();
}
