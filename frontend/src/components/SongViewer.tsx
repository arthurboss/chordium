import ChordDisplay from "@/components/ChordDisplay";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";

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
  
  // Use lazy loading for saved chord sheets
  const { content: lazyContent, isContentLoading } = useLazyChordSheet({ 
    path: isFromMyChordSheets ? songObj.path : '' 
  });

  // Determine the chord content to display
  const chordContentToDisplay = useMemo(() => {
    // If direct chord content is provided, use it (for search results)
    if (directChordContent) {
      return directChordContent;
    }

    // If this is from myChordSheets, use the lazy loaded content
    if (isFromMyChordSheets) {
      return lazyContent || '';
    }

    return '';
  }, [directChordContent, isFromMyChordSheets, lazyContent]);

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
