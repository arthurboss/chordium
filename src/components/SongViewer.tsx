import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";
import { Card } from "./ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";

interface SongViewerProps {
  song: { song: Song; chordSheet: ChordSheet };
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
                onDelete(songObj.path);
              }
            }}
            tabIndex={0}
            aria-label="delete chord sheet"
          >
            <Trash2 className="h-4 w-4 text-destructive dark:text-red-500" />
            Delete
          </Button>
        )}
      </Card>
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
