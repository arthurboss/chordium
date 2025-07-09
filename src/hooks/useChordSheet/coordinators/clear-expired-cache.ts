import { clearExpiredChordSheetCache } from '../../../cache/implementations/unified-chord-sheet-cache';

/**
 * Clears expired cache entries
 */
export function clearExpiredCache(): void {
  clearExpiredChordSheetCache();
}
