import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import type { Song } from "../types/song";
import type { ChordSheet } from "@/types/chordSheet";
import { Card } from "./ui/card";
import { ArrowLeft, Trash2, Save } from "lucide-react";

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
      <Card className="flex flex-row p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mr-2"
          tabIndex={0}
          aria-label="back-button"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          Back
        </Button>

        {/* Show Save button for search results, Delete button for My Chord Sheets */}
        {!hideSaveButton && !isFromMyChordSheets && onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            tabIndex={0}
            aria-label="save to my chord sheets"
          >
            <Save className="h-4 w-4 text-primary" />
            Save
          </Button>
        )}

        {!hideDeleteButton && (isFromMyChordSheets || (!onSave || hideSaveButton)) && (
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
            <Trash2 className="h-4 w-4 text-destructive dark:text-red-300" />
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
