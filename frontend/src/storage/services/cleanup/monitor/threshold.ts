import { LIMITS } from "../../../core/ttl/limits";
import { getCurrentUsage } from "./usage";

/**
 * Checks if cleanup should be triggered based on usage thresholds
 */
export async function shouldTriggerCleanup(): Promise<boolean> {
  const usage = await getCurrentUsage();
  return usage.usageRatio > LIMITS.CLEANUP_THRESHOLD;
}
