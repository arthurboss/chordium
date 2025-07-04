import { clearExpiredChordSheetCache } from '../../../cache/implementations/unified-chord-sheet';

/**
 * Clears expired cache entries
 */
export function clearExpiredCache(): void {
  clearExpiredChordSheetCache();
}
