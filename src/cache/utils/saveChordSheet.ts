import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '../storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Save a chord sheet to the cache using path as identifier
 * 
 * @param path - The unique path identifier from the API response
 * @param chordSheet - The chord sheet data to store
 * @param options - Storage options
 * @param options.saved - Whether this is a permanently saved chord sheet (default: false for cache)
 * @param options.expiresAt - Optional expiration timestamp for cached items
 * 
 * @throws Error if path is empty or chordSheet is invalid
 */
export async function saveChordSheet(
  path: string, 
  chordSheet: ChordSheet, 
  options: {
    saved?: boolean;
    expiresAt?: number;
  } = {}
): Promise<void> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required and cannot be empty');
  }

  if (!chordSheet?.artist || !chordSheet?.title) {
    throw new Error('Valid chord sheet with artist and title is required');
  }

  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    
    await repository.storeByPath(path, chordSheet, {
      saved: options.saved ?? false,
      expiresAt: options.expiresAt
    });
  } finally {
    await repository.close();
  }
}
