import ChordDisplay from "@/components/ChordDisplay";
import { PageHeader } from "@/components/PageHeader";
import { ChordMetadata } from "@/components/ChordDisplay/ChordMetadata";
import type { ContentStructureProps } from "../ChordSheetPage.types";

/**
 * Main content structure component for chord sheet display
 * 
 * Displays the complete chord sheet with real data, including
 * save/delete functionality and progressive loading support.
 */
export const ChordSheetContent = ({
  song,
  chordContent,
  chordDisplayRef,
  onBack,
  onDelete,
  onSave,
  onUpdate,
  hideDeleteButton,
  hideSaveButton,
  isFromMyChordSheets,
  useProgressiveLoading,
  loadContent,
  isContentLoading
}: ContentStructureProps) => {
  const shouldShowActionButton = (!hideDeleteButton && isFromMyChordSheets) || (!hideSaveButton && !isFromMyChordSheets);
  
  const handleAction = () => {
    if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(song.song.path);
    } else if (!hideSaveButton && !isFromMyChordSheets) {
      onSave();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col">
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton ? handleAction : undefined}
        isSaved={isFromMyChordSheets}
        title={song.chordSheet.title || 'Untitled'}
      />
      <div className="py-2 sm:py-4 px-4">
        <ChordMetadata chordSheet={song.chordSheet} />
      </div>
      <ChordDisplay
        ref={chordDisplayRef}
        chordSheet={song.chordSheet}
        content={chordContent}
        onSave={onUpdate}
        isLoading={isContentLoading}
      />
    </div>
  );
};
