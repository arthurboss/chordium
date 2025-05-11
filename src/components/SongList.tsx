import { SongData } from "../types/song";
import SongCard from "./SongCard";
import { Button } from "@/components/ui/button";

interface SongListProps {
  songs: SongData[];
  onSongSelect: (song: SongData) => void;
  onDeleteSong: (songId: string) => void;
  onUploadClick: () => void;
}

const SongList = ({ songs, onSongSelect, onDeleteSong, onUploadClick }: SongListProps) => {
  return (
    <div>
      {songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...songs].reverse().map(song => (
            <SongCard 
              key={song.id} 
              song={song} 
              onView={onSongSelect} 
              onDelete={onDeleteSong} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-3">You haven't saved any songs yet.</p>
          <Button 
            onClick={onUploadClick}
            variant="outline"
            tabIndex={0}
            aria-label="Upload a chord sheet"
          >
            Upload a chord sheet
          </Button>
        </div>
      )}
    </div>
  );
};

export default SongList;
