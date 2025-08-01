import deleteChordSheet from "@/storage/stores/chord-sheets/operations/delete-chord-sheet";

/**
 * Deletes a chord sheet from database storage
 * 
 * @param path - Storage path of chord sheet to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteChordSheetFromStorage(path: string): Promise<void> {
  await deleteChordSheet(path);
}
