import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject } from "react";
import { SongData } from "../types/song";

interface SongViewerProps {
  song: SongData;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songId: string) => void;
  onUpdate: (content: string) => void;
}

const SongViewer = ({ song, chordDisplayRef, onBack, onDelete, onUpdate }: SongViewerProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="mr-2"
          tabIndex={0}
          aria-label="Back to My Songs"
        >
          Back to My Songs
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(song.id)}
          tabIndex={0}
          aria-label={`Delete ${song?.title || 'song'}`}
        >
          Delete Song
        </Button>
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
