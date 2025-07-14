import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import { Song } from "../types/song";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";

interface SongViewerProps {
  song: Song;
  chordContent?: string; // Direct chord content (for search results)
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onUpdate: (content: string) => void;
  backButtonLabel?: string;
  deleteButtonLabel?: string;
  deleteButtonVariant?: "outline" | "destructive" | "default";
  hideDeleteButton?: boolean;
}

const SongViewer = ({
  song,
  chordContent: directChordContent,
  chordDisplayRef,
  onBack,
  onDelete,
  onUpdate,
  backButtonLabel = "Back to My Chord Sheets",
  deleteButtonLabel = "Delete Song",
  deleteButtonVariant = "destructive",
  hideDeleteButton = false
}: SongViewerProps) => {

  // Load chord sheet content - use direct content if provided, otherwise load from cache
  const chordContent = useMemo(() => {

    if (directChordContent) {
      return directChordContent;
    }

    // Validate song object to prevent cache key generation errors
    if (!song.artist || !song.title) {
      return '';
    }

    // Try to get from cache using artist and title
    const cachedChordSheet = unifiedChordSheetCache.getCachedChordSheet(song.artist, song.title);

    return cachedChordSheet?.songChords ?? '';
  }, [song, directChordContent]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mr-2"
          tabIndex={0}
          aria-label={backButtonLabel}
        >
          {backButtonLabel}
        </Button>
        {!hideDeleteButton && (
          <Button
            size="sm"
            variant={deleteButtonVariant}
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(song.path);
              }
            }}
            tabIndex={0}
            aria-label={deleteButtonLabel || `Delete ${song.title}`}
          >
            {deleteButtonLabel || "Delete Song"}
          </Button>
        )}
      </div>
      <div className="mt-6">
        <ChordDisplay
          ref={chordDisplayRef}
          title={song.title}
          artist={song.artist}
          content={chordContent}
          onSave={onUpdate}
        />
      </div>
    </div>
  );
};

export default SongViewer;
