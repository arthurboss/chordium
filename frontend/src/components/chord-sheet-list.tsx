import { useRef } from "react";
import type { ChordSheetListProps } from "./chord-sheet-list.types";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";

const ChordSheetList = ({ 
  chordSheets, 
  onChordSheetSelect, 
  onDeleteChordSheet, 
  onUploadClick, 
  tabState, 
  setTabState 
}: ChordSheetListProps) => {
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
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-3">You haven't saved any chord sheets yet.</p>
          <Button
            onClick={onUploadClick}
            variant="outline"
            tabIndex={0}
            aria-label="Upload a chord sheet"
          >
            Upload a chord sheet
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChordSheetList;
