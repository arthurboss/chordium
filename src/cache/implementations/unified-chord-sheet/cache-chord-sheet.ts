import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';
import { CacheChordSheetOptions } from '../../types/unified-chord-sheet-cache';

/**
 * Normalize a string for use in paths (memory-efficient version)
 */
function normalizeStringForPath(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '');
}

/**
 * Generate a path from artist and title
 */
function generatePathFromArtistTitle(artist: string, title: string): string {
  const normalizedArtist = normalizeStringForPath(artist);
  const normalizedTitle = normalizeStringForPath(title);
  return `${normalizedArtist}/${normalizedTitle}`;
}

/**
 * Cache a chord sheet with optional metadata
 */
export const cacheChordSheet = async (
  repository: ChordSheetRepository,
  artist: string, 
  title: string, 
  chordSheet: ChordSheet, 
  options: CacheChordSheetOptions = {}
): Promise<void> => {
  if (!artist || !title) {
    console.warn('Cannot cache chord sheet: invalid artist or title', { artist, title });
    return;
  }

  try {
    // Generate the path for checking if saved
    const path = generatePathFromArtistTitle(artist, title);
    
    // Check if item already exists and if it's saved
    const wasSaved = await repository.isSavedByPath(path);
    
    // Determine final saved status - if options.saved is specified, use it, otherwise preserve existing saved status
    const shouldSave = options.saved ?? wasSaved;

    // Store the chord sheet with appropriate method
    await repository.storeByPath(path, chordSheet, { 
      saved: shouldSave, 
      dataSource: options.dataSource 
    });
  } catch (error) {
    console.error('Failed to cache chord sheet in IndexedDB:', error);
  }
};
