import ChordDisplay from "@/components/ChordDisplay";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";
import { useProgressiveChordSheet, combineChordSheet } from "@/hooks/useProgressiveChordSheet";

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
  // Progressive loading props
  useProgressiveLoading?: boolean;
  onLoadContent?: () => void;
  loadContent?: () => Promise<void>;
  isContentLoading?: boolean;
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
  isFromMyChordSheets = false,
  useProgressiveLoading = false,
  onLoadContent,
  loadContent,
  isContentLoading
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  
  // Progressive loading for API-fetched chord sheets
  const progressiveResult = useProgressiveChordSheet(
    useProgressiveLoading ? songObj.path : ''
  );
  
  // Use lazy loading for saved chord sheets
  const { content: lazyContent, isContentLoading: isLazyContentLoading } = useLazyChordSheet({ 
    path: isFromMyChordSheets ? songObj.path : '' 
  });

  // Determine the chord content to display
  const chordContentToDisplay = useMemo(() => {
    // If direct chord content is provided, use it (for search results)
    if (directChordContent) {
      return directChordContent;
    }

    // If using progressive loading, use the API content
    if (useProgressiveLoading && progressiveResult.content) {
      return progressiveResult.content.songChords;
    }

    // If this is from myChordSheets, use the lazy loaded content
    if (isFromMyChordSheets) {
      return lazyContent || '';
    }

    return '';
  }, [directChordContent, useProgressiveLoading, progressiveResult.content, isFromMyChordSheets, lazyContent]);

  // Determine the chord sheet to display (metadata)
  const chordSheetToDisplay = useMemo(() => {
    // If using progressive loading and we have metadata, use it
    if (useProgressiveLoading && progressiveResult.metadata) {
      return combineChordSheet(progressiveResult.metadata, { songChords: '' });
    }
    
    // Otherwise use the provided chord sheet
    return chordSheet;
  }, [useProgressiveLoading, progressiveResult.metadata, chordSheet]);

  // Handle content loading
  const handleLoadContent = () => {
    if (useProgressiveLoading && loadContent) {
      loadContent();
    } else if (useProgressiveLoading && !progressiveResult.content) {
      progressiveResult.loadContent();
    }
    onLoadContent?.();
  };

  const handleAction = () => {
    if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(songObj.path);
    } else if (!hideSaveButton && !isFromMyChordSheets && onSave) {
      onSave();
    }
  };

  const shouldShowActionButton = (isFromMyChordSheets && !hideDeleteButton) || (!hideSaveButton && !isFromMyChordSheets && !!onSave);

  // Determine loading states
  const finalIsContentLoading = useProgressiveLoading 
    ? (isContentLoading ?? progressiveResult.isLoadingContent)
    : isLazyContentLoading;

  return (
    <div className="animate-fade-in flex flex-col">
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton && handleAction}
        isSaved={shouldShowActionButton && isFromMyChordSheets}
        title={chordSheetToDisplay.title}
      />
      <div className="py-2 sm:py-4 px-4">
        <ChordMetadata chordSheet={chordSheetToDisplay} />
      </div>
      <ChordDisplay
        ref={chordDisplayRef}
        chordSheet={chordSheetToDisplay}
        content={chordContentToDisplay}
        onSave={onUpdate}
        isLoading={finalIsContentLoading}
        onLoadContent={useProgressiveLoading ? handleLoadContent : undefined}
      />
    </div>
  );
};

export default SongViewer;
