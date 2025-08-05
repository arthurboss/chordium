/**
 * Fetches a chord sheet from the API and stores it in IndexedDB.
 * @param path - Unique chord sheet identifier
 * @returns The chord sheet if fetched, otherwise null
 */
import { fetchChordSheetFromAPI } from "@/services/api/fetch-chord-sheet";
import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import { ChordSheetStore } from "@/storage/stores/chord-sheets/store";

export async function fetchAndStoreChordSheet(path: string) {
  const apiChordSheet = await fetchChordSheetFromAPI(path);
  if (apiChordSheet) {
    await storeChordSheet(apiChordSheet, false, path);
    const store = new ChordSheetStore();
    return await store.get(path);
  }
  return null;
}
