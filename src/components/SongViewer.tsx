import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import { Song } from "../types/song";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";
import { Card } from "./ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";

interface SongViewerProps {
  song: Song;
  chordContent?: string; // Direct chord content (for search results)
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onUpdate: (content: string) => void;
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
  deleteButtonLabel = "Delete Song",
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
      <Card className="flex flex-row p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mr-2"
          tabIndex={0}
          aria-label="back-button"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
        {!hideDeleteButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(song.path);
              }
            }}
            tabIndex={0}
            aria-label="delete chord sheet"
          >
            <Trash2 className="h-4 w-4" color="red" />
            Delete
          </Button>
        )}
      </Card>
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
