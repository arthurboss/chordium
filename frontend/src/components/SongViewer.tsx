import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import NavigationCard from "@/components/NavigationCard";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { useChordSheets } from "@/storage/hooks/use-chord-sheets";
import { Save } from "lucide-react";

interface SongViewerProps {
  song: { song: Song; chordSheet: ChordSheet };
  chordContent?: string; // Direct chord content (for search results)
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onSave?: () => void;
  onUpdate: (content: string) => void;
  hideDeleteButton?: boolean;
  hideSaveButton?: boolean;
  isFromMyChordSheets?: boolean;
}

const SongViewer = ({
  song,
  chordContent: directChordContent,
  chordDisplayRef,
  onBack,
  onDelete,
  onSave,
  onUpdate,
  hideDeleteButton = false,
  hideSaveButton = false,
  isFromMyChordSheets = false
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  const { myChordSheets } = useChordSheets();

  // Determine the chord content to display
  const chordContentToDisplay = useMemo(() => {
    // If direct chord content is provided, use it (for search results)
    if (directChordContent) {
      return directChordContent;
    }

    // If this is from myChordSheets, look up the chord content from stored data
    if (isFromMyChordSheets && songObj.artist && songObj.title) {
      const storedChordSheet = myChordSheets.find(stored => 
        stored.artist === songObj.artist && stored.title === songObj.title
      );
      return storedChordSheet?.songChords ?? '';
    }

    return '';
  }, [songObj, directChordContent, isFromMyChordSheets, myChordSheets]);

  return (
    <div className="animate-fade-in">
      <NavigationCard
        onBack={onBack}
        onDelete={isFromMyChordSheets && !hideDeleteButton ? () => onDelete(songObj.path) : undefined}
        showDeleteButton={isFromMyChordSheets && !hideDeleteButton}
      >
        {/* Show Save button for search results only */}
        {!hideSaveButton && !isFromMyChordSheets && onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            tabIndex={0}
            aria-label="save to my chord sheets"
            className="ml-auto"
          >
            <Save className="h-4 w-4 text-primary" />
            Save
          </Button>
        )}
      </NavigationCard>
      <div className="mt-6">
        <ChordDisplay
          ref={chordDisplayRef}
          chordSheet={chordSheet}
          content={chordContentToDisplay}
          onSave={onUpdate}
        />
      </div>
    </div>
  );
};

export default SongViewer;
