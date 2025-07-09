/**
 * Type for local song result from local storage / cache
 */
export interface LocalSongResult {
  id: string;
  title: string;
  artist?: string;
  content: string;
  path: string;
  metadata?: {
    saved: boolean;
    lastAccessed: number;
    accessCount: number;
  };
}

/**
 * Find a local song by ID from local storage or cache
 * @param id - The song ID to find
 * @returns Promise resolving to LocalSongResult or null if not found
 */
export async function findLocalSong(id: string): Promise<LocalSongResult | null> {
  try {
    // Try to get from unified cache first
    const { unifiedChordSheetCache } = await import('@/cache/implementations/unified-chord-sheet');
    const cachedItem = await unifiedChordSheetCache.getCachedChordSheetByPath(id);
    
    if (cachedItem) {
      return {
        id: id,
        title: cachedItem.title,
        artist: cachedItem.artist,
        content: cachedItem.songChords,
        path: cachedItem.songChords, // For backward compatibility
        metadata: {
          saved: true, // Assume saved if found in cache
          lastAccessed: Date.now(),
          accessCount: 1
        }
      };
    }
    
    // Fallback to localStorage for backward compatibility
    const savedSongs = localStorage.getItem('my-songs');
    if (savedSongs) {
      const songs = JSON.parse(savedSongs);
      const song = songs.find((s: { id: string }) => s.id === id);
      if (song) {
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          content: song.path ?? song.content,
          path: song.path ?? song.content,
          metadata: {
            saved: true,
            lastAccessed: Date.now(),
            accessCount: 1
          }
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding local song:', error);
    return null;
  }
}

/**
 * Get all local songs from cache and localStorage
 * @returns Promise resolving to array of LocalSongResult
 */
export async function getAllLocalSongs(): Promise<LocalSongResult[]> {
  const songs: LocalSongResult[] = [];
  
  try {
    // Get from unified cache
    const { unifiedChordSheetCache } = await import('@/cache/implementations/unified-chord-sheet');
    const cachedItems = await unifiedChordSheetCache.getAllSavedChordSheets();
    
    for (const item of cachedItems) {
      songs.push({
        id: `${item.artist}-${item.title}`, // Generate ID from artist and title
        title: item.title,
        artist: item.artist,
        content: item.songChords,
        path: item.songChords,
        metadata: {
          saved: true, // These are saved items
          lastAccessed: Date.now(),
          accessCount: 1
        }
      });
    }
    
    // Fallback to localStorage for backward compatibility
    const savedSongs = localStorage.getItem('my-songs');
    if (savedSongs) {
      const localSongs = JSON.parse(savedSongs);
      for (const song of localSongs) {
        // Avoid duplicates
        if (!songs.find(s => s.id === song.id)) {
          songs.push({
            id: song.id,
            title: song.title,
            artist: song.artist,
            content: song.path ?? song.content,
            path: song.path ?? song.content,
            metadata: {
              saved: true,
              lastAccessed: Date.now(),
              accessCount: 1
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error getting local songs:', error);
  }
  
  return songs;
}

/**
 * Clear all cached chord sheets (useful for debugging/testing)
 * @returns Promise that resolves when cache is cleared
 */
export async function clearAllLocalSongs(): Promise<void> {
  try {
    const { unifiedChordSheetCache } = await import('@/cache/implementations/unified-chord-sheet');
    await unifiedChordSheetCache.clearAllCache();
    console.log('🧹 All local songs cleared from cache');
  } catch (error) {
    console.error('Error clearing local songs:', error);
  }
}
