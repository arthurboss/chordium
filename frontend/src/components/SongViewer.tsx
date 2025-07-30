import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";

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

  // Load chord sheet content - use direct content if provided, otherwise use chord sheet content
  const chordContent = useMemo(() => {

    if (directChordContent) {
      return directChordContent;
    }

    // Use the chord sheet content from the prop
    if (chordSheet?.songChords) {
      return chordSheet.songChords;
    }

    // Validate song object to prevent cache key generation errors
    if (!songObj.artist || !songObj.title) {
      return '';
    }

    // Fallback for edge cases
    return '';
  }, [songObj, directChordContent, chordSheet?.songChords]);

  return (
    <div className="animate-fade-in">
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
