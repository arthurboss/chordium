import ChordDisplay from "@/components/ChordDisplay";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import { RefObject, useMemo, useEffect, useState } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { useChordSheets } from "@/storage/hooks/use-chord-sheets";
import { getChordSheet } from "@/storage/stores/chord-sheets/operations";

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
  const [storedChordContent, setStoredChordContent] = useState<string>('');

  // Load chord content from storage when viewing a saved chord sheet
  useEffect(() => {
    if (isFromMyChordSheets && songObj.path) {
      getChordSheet(songObj.path).then(storedSheet => {
        if (storedSheet?.songChords) {
          setStoredChordContent(storedSheet.songChords);
        }
      });
    }
  }, [isFromMyChordSheets, songObj.path]);

  // Determine the chord content to display
  const chordContentToDisplay = useMemo(() => {
    // If direct chord content is provided, use it (for search results)
    if (directChordContent) {
      return directChordContent;
    }

    // If this is from myChordSheets, use the loaded stored content
    if (isFromMyChordSheets) {
      return storedChordContent;
    }

    return '';
  }, [directChordContent, isFromMyChordSheets, storedChordContent]);

  const handleAction = () => {
    if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(songObj.path);
    } else if (!hideSaveButton && !isFromMyChordSheets && onSave) {
      onSave();
    }
  };

  const shouldShowActionButton = (isFromMyChordSheets && !hideDeleteButton) || (!hideSaveButton && !isFromMyChordSheets && !!onSave);

  return (
    <div className="animate-fade-in flex flex-col">
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton && handleAction}
        isSaved={shouldShowActionButton && isFromMyChordSheets}
        title={chordSheet.title}
      />
      <div className="py-2 sm:py-4 px-4">
        <ChordMetadata chordSheet={chordSheet} />
      </div>
      <ChordDisplay
        ref={chordDisplayRef}
        chordSheet={chordSheet}
        content={chordContentToDisplay}
        onSave={onUpdate}
      />
    </div>
  );
};

export default SongViewer;
