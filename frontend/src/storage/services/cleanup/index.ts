/**
 * Smart cleanup system for IndexedDB storage
 * Barrel export for all cleanup-related functionality
 */

// Strategy exports
export type { CleanupStrategy } from './strategy';
export {
  calculateChordSheetCleanupPriority,
  calculateSearchCacheCleanupPriority,
  calculateAccessFrequencyPriority,
  calculateTimePriority
} from './strategy';

// Monitor exports  
export type { StorageEstimate } from './monitor';
export {
  getCurrentUsage,
  shouldTriggerCleanup,
  wouldExceedAfterWrite
} from './monitor';

// Service exports
export type { CleanupResult } from './service';
export {
  estimateChordSheetSize,
  estimateSearchCacheSize,
  createEmptyResult
} from './service';

// Trigger exports
export {
  triggerOnAppStart,
  triggerBeforeWrite,
  setupPeriodicCleanup,
  stopPeriodicCleanup
} from './triggers';
