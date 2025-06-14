import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useMemo } from "react";
import { Song } from "../types/song";
import { getChordSheet } from "@/utils/chord-sheet-storage";

interface SongViewerProps {
  song: Song;
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
  chordDisplayRef, 
  onBack, 
  onDelete, 
  onUpdate,
  backButtonLabel = "Back to My Songs",
  deleteButtonLabel = "Delete Song",
  deleteButtonVariant = "destructive",
  hideDeleteButton = false
}: SongViewerProps) => {
  // Load chord sheet content using song.path as the chord sheet ID
  const chordContent = useMemo(() => {
    const chordSheet = getChordSheet(song.path);
    return chordSheet?.chords || '';
  }, [song.path]);

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
            variant={deleteButtonVariant}
            size="sm"
            onClick={() => onDelete(song.path)}
            tabIndex={0}
            aria-label={deleteButtonLabel}
          >
            {deleteButtonLabel}
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
