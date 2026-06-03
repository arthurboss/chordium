import ChordDisplay from "@/components/ChordDisplay";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";
import { JamQRModal } from "@/features/jam-session/components/JamQRModal";

interface SongViewerProps {
  song: { song: Song; chordSheet: ChordSheet };
  chordContent?: string;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onSave?: () => void;
  onUpdate: (content: string) => void;
  hideDeleteButton?: boolean;
  hideSaveButton?: boolean;
  isFromMyChordSheets?: boolean;
  useProgressiveLoading?: boolean;
  loadContent?: () => Promise<void>;
  isContentLoading?: boolean;
  onViewModeChange?: (viewMode: string) => void;
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
  loadContent,
  isContentLoading,
  onViewModeChange,
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  
  const { content: lazyContent, isContentLoading: isLazyContentLoading } = useLazyChordSheet({ 
    path: isFromMyChordSheets ? songObj.path : '' 
  });

  const chordContentToDisplay = useMemo(() => {
    if (directChordContent) {
      return directChordContent;
    }
    if (isFromMyChordSheets) {
      return lazyContent || '';
    }
    return chordSheet.songChords || '';
  }, [directChordContent, isFromMyChordSheets, lazyContent, chordSheet.songChords]);

  const chordSheetToDisplay = useMemo(() => {
    return chordSheet;
  }, [chordSheet]);

  const handleLoadContent = () => {
    if (useProgressiveLoading && loadContent) {
      loadContent();
    }
  };

  const handleAction = () => {
    if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(songObj.path);
    } else if (!hideSaveButton && !isFromMyChordSheets && onSave) {
      onSave();
    }
  };

  const shouldShowActionButton = (isFromMyChordSheets && !hideDeleteButton) || (!hideSaveButton && !isFromMyChordSheets && !!onSave);

  const finalIsContentLoading = useProgressiveLoading 
    ? isContentLoading
    : isLazyContentLoading;

  return (
    <div className="animate-fade-in flex flex-col">
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton && handleAction}
        isSaved={shouldShowActionButton && isFromMyChordSheets}
        title={chordSheetToDisplay.title}
        rightContent={
          chordContentToDisplay
            ? <JamQRModal chordSheet={{ ...chordSheetToDisplay, songChords: chordContentToDisplay }} />
            : undefined
        }
      />
      <div className="py-2 pl-1 sm:py-0 sm:px-1">
        <ChordMetadata chordSheet={chordSheetToDisplay} path={songObj.path} />
      </div>
      <ChordDisplay
        ref={chordDisplayRef}
        chordSheet={chordSheetToDisplay}
        content={chordContentToDisplay}
        onSave={onUpdate}
        isLoading={finalIsContentLoading}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
};

export default SongViewer;
