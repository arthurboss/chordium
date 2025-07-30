/**
 * Chord sheet cleanup priority calculation
 * 
 * Re-exports the main cleanup function from the refactored modular structure.
 * The actual implementation is now split into focused modules:
 * - saved-strategy: Simple rules for saved items
 * - cached-strategy: Complex LRU logic for cached items  
 * - priority-calculator: Orchestrates strategy selection
 * 
 * CRITICAL: Saved items are NEVER automatically removed
 */

export { calculateChordSheetCleanupPriority } from './chord-sheet/priority-calculator';
