import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject } from "react";
import { Song } from "../types/song";

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
          content={song.path}
          onSave={onUpdate}
        />
      </div>
    </div>
  );
};

export default SongViewer;
