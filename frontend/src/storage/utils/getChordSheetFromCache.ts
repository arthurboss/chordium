/**
 * Gets a chord sheet from IndexedDB cache by path.
 * @param path - Unique chord sheet identifier
 * @returns The chord sheet if found, otherwise null
 */
import { ChordSheetStore } from "@/storage/stores/chord-sheets/store";

export async function getChordSheetFromCache(path: string) {
  const store = new ChordSheetStore();
  return await store.get(path);
}
