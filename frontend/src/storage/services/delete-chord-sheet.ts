/**
 * Delete chord sheet service
 */

import type { ChordSheet } from '@chordium/types';
import type { ChordiumDBSchema } from '@/storage/types/schema';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';
import { toast } from "@/hooks/use-toast";

/**
 * Delete a chord sheet by path with user feedback
 * 
 * @param path - Database key (path) for the chord sheet to delete
 * @param title - Chord sheet title for user feedback
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteChordSheet(path: ChordiumDBSchema['chordSheets']['path'], title: ChordSheet["title"]): Promise<void> {
  try {
    const store = new ChordSheetStore();
    await store.delete(path);

    toast({
      title: "Chord sheet deleted",
      description: `"${title}" has been removed from My Chord Sheets`,
    });
  } catch (error) {
    console.error('Failed to delete chord sheet:', error);
    toast({
      title: "Delete failed",
      description: `Failed to delete "${title}". Please try again.`,
      variant: "destructive"
    });
    throw error;
  }
}
