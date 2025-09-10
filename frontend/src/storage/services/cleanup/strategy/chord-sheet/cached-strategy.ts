import type { StoredSongMetadata } from "../../../../types";
import type { CleanupStrategy } from "../types";
import { calculateAccessFrequencyPriority } from "../access-frequency";
import { daysSince } from "../../../../utils/time-constants";

/**
 * Strategy for cached chord sheets using LRU logic
 *
 * Calculates priority based on:
 * - How recently the item was accessed (recency)
 * - How frequently the item is accessed (frequency)
 *
 * @param metadata The cached chord sheet metadata to evaluate
 * @returns Strategy with priority and removal permission
 */
export function calculateCachedChordSheetStrategy(
  metadata: StoredSongMetadata
): CleanupStrategy {
  if (metadata.storage.saved) {
    throw new Error("calculateCachedChordSheetStrategy called on saved item");
  }

  let priority = 0;
  const reasons: string[] = [];

  // LRU Logic: Recently accessed items get higher priority (kept longer)
  const daysSinceLastAccess = daysSince(metadata.storage.lastAccessed);

  if (daysSinceLastAccess < 1) {
    priority += 50;
    reasons.push("accessed today");
  } else if (daysSinceLastAccess < 3) {
    priority += 30;
    reasons.push("accessed recently");
  } else if (daysSinceLastAccess < 7) {
    priority += 15;
    reasons.push("accessed this week");
  } else if (daysSinceLastAccess < 30) {
    priority += 5;
    reasons.push("accessed this month");
  }
  // Items not accessed in 30+ days get priority 0 (first to be removed)

  // Access frequency bonus: Use shared utility
  const accessFrequency = calculateAccessFrequencyPriority(
    metadata.storage.accessCount
  );
  priority += accessFrequency.priority;
  if (accessFrequency.reason) {
    reasons.push(accessFrequency.reason);
  }

  return {
    priority,
    reason: reasons.join(", ") || "rarely used",
    canRemove: true,
  };
}
