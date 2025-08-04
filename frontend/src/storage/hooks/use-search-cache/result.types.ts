import type { UseSearchCacheState } from "./state.types";
import type { UseSearchCacheOperations } from "./operations.types";

/**
 * Complete result interface for useSearchCache hook
 */
export interface UseSearchCacheResult extends UseSearchCacheState, UseSearchCacheOperations {}

// Re-export all types for convenience
export type { UseSearchCacheParams } from "./params.types";
export type { UseSearchCacheState } from "./state.types";
export type { UseSearchCacheOperations } from "./operations.types";
