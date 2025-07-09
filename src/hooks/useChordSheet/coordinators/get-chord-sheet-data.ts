import { ChordSheet } from "@/types/chordSheet";
import { unifiedChordSheetCache } from "../../../cache/implementations/unified-chord-sheet";
import { parseStorageKey } from "../utils/parse-storage-key";
import { fetchChordSheetFromBackend } from "./fetch-chord-sheet-from-backend";

/**
 * Gets chord sheet data, checking cache first then fetching if needed
 *
 * @param storageKey - Combined storage key (artist_name-song_title)
 * @param fetchUrl - URL to fetch from if not cached
 * @returns Promise with chord sheet data or null if failed
 */
export async function getChordSheetData(
  storageKey: string,
  fetchUrl: string
): Promise<ChordSheet | null> {
  // Parse the storage key to get artist and title
  const { artist, title } = parseStorageKey(storageKey);

  // First check IndexedDB cache (async)
  const cachedChordSheet =
    await unifiedChordSheetCache.getCachedChordSheetByPath(artist, title);

  if (cachedChordSheet) {
    console.log("Using cached chord sheet from IndexedDB");
    return cachedChordSheet;
  }

  // Not cached, fetch from backend
  const chordSheet = await fetchChordSheetFromBackend(fetchUrl, artist, title);

  if (chordSheet) {
    console.log("✅ Flow Step 8: Caching chord sheet data in IndexedDB");
    // Cache the chord sheet using the parsed artist and title (async)
    await unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);
    console.log("✅ Flow Step 9: Chord sheet cached successfully in IndexedDB");
  }

  return chordSheet;
}
