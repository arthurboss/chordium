import { LIMITS } from "../../../core/ttl/limits";
import type { StorageEstimate } from "./types";

/**
 * Gets current storage usage from browser Storage API
 */
export async function getCurrentUsage(): Promise<StorageEstimate> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || LIMITS.TOTAL_STORAGE_TARGET,
      usageRatio: (estimate.usage || 0) / LIMITS.TOTAL_STORAGE_TARGET,
    };
  }

  return createFallbackEstimate();
}

/**
 * Fallback estimation when Storage API unavailable
 */
function createFallbackEstimate(): StorageEstimate {
  const estimatedUsage = LIMITS.TOTAL_STORAGE_TARGET * 0.5;
  return {
    usage: estimatedUsage,
    quota: LIMITS.TOTAL_STORAGE_TARGET,
    usageRatio: 0.5,
  };
}
