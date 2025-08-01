import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import NavigationCard from "@/components/NavigationCard";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";
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

  // Load chord sheet content - use direct content if provided, otherwise load from cache
  const chordContent = useMemo(() => {

    if (directChordContent) {
      return directChordContent;
    }

    // Validate song object to prevent cache key generation errors
    if (!songObj.artist || !songObj.title) {
      return '';
    }

    // Try to get from cache using artist and title
    const cachedChordSheet = unifiedChordSheetCache.getCachedChordSheet(songObj.artist, songObj.title);

    return cachedChordSheet?.songChords ?? '';
  }, [songObj, directChordContent]);

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
          content={chordContent}
          onSave={onUpdate}
        />
      </div>
    </div>
  );
};

export default SongViewer;
