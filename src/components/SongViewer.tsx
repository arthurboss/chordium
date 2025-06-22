import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import { Song } from "../types/song";
import { getCachedChordSheet } from "@/cache";

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
  backButtonLabel = "Back to My Songs",
  deleteButtonLabel = "Delete Song",
  deleteButtonVariant = "destructive",
  hideDeleteButton = false
}: SongViewerProps) => {

  console.log('🎵 SONG VIEWER DEBUG:');
  console.log('Received song prop:', song);
  console.log('Song title:', song.title);
  console.log('Song artist:', song.artist);
  console.log('Song path:', song.path);
  console.log('Direct chord content provided:', !!directChordContent);

  // Load chord sheet content - use direct content if provided, otherwise load from cache
  const chordContent = useMemo(() => {
    console.log('🔍 LOADING CHORD CONTENT:');

    if (directChordContent) {
      console.log('✅ Using direct chord content (search result)');
      console.log('Direct content preview:', directChordContent.substring(0, 100) + '...');
      return directChordContent;
    }

    console.log('🏪 Loading from cache (My Songs)');
    console.log('Song object:', song);
    console.log('Song path (might be CifraClub format):', song.path);

    // Validate song object to prevent cache key generation errors
    if (!song.artist || !song.title) {
      console.warn('⚠️ SongViewer received invalid song object:', song);
      return '';
    }

    // Try to get from cache using artist and title
    const cachedChordSheet = getCachedChordSheet(song.artist, song.title);

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
              console.log('Delete button clicked, calling onDelete with path:', song.path);
              if (onDelete) {
                onDelete(song.path);
              } else {
                console.error('onDelete is not provided!');
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
