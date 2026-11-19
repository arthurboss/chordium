import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";
import type { StoredList } from "@/storage/stores/lists";

export interface ChordSheetCardProps {
  chordSheet: ChordSheetListItem;
  onView: (chordSheet: ChordSheetListItem) => void;
  onDelete: (chordSheet: ChordSheetListItem) => void;
  /** Every custom list, passed through to the "add to list" picker */
  lists: StoredList[];
  /** Ids of the lists this chord sheet currently belongs to */
  listIdsForPath: string[];
  /** Adds the chord sheet to the list if absent, removes it if present */
  onToggleList: (listId: string) => void;
  /** Creates a new list, used by the picker's inline "+ new list" input */
  onCreateList: (name: string) => Promise<StoredList | void>;
}
