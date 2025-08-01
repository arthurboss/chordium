import type { StoredChordSheet } from "@/storage/types";
import ResultCard from "@/components/ResultCard";
import EmptyChordSheetState from "./empty-chord-sheet-state";

interface ChordSheetListProps {
  chordSheets: StoredChordSheet[];
  onChordSheetSelect: (storedChordSheet: StoredChordSheet) => void;
  onDeleteChordSheet: (chordSheetPath: string) => void;
  onUploadClick: () => void;
  tabState?: { scroll: number };
  setTabState?: (state: { scroll: number }) => void;
}


import { useRef } from "react";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";

const ChordSheetList = ({ chordSheets, onChordSheetSelect, onDeleteChordSheet, onUploadClick, tabState, setTabState }: ChordSheetListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  return (
    <div ref={listRef} style={{ maxHeight: "60vh", overflowY: "auto" }}>
      {chordSheets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...chordSheets].reverse().map((storedChordSheet, index) => (
            <ResultCard
              key={`${storedChordSheet.path}-${index}`}
              icon="music"
              title={storedChordSheet.title}
              subtitle={storedChordSheet.artist}
              onView={() => onChordSheetSelect(storedChordSheet)}
              onDelete={onDeleteChordSheet}
              path={storedChordSheet.path}
              isDeletable={true}
              song={{
                path: storedChordSheet.path,
                title: storedChordSheet.title,
                artist: storedChordSheet.artist
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyChordSheetState onUploadClick={onUploadClick} />
      )}
    </div>
  );
};

export default ChordSheetList;
