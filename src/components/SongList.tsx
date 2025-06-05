import { Song } from "../types/song";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

interface SongListProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onUploadClick: () => void;
}

const SongList = ({ songs, onSongSelect, onDeleteSong, onUploadClick }: SongListProps) => {
  return (
    <div>
      {songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...songs].reverse().map((song, index) => (
            <ResultCard
              key={`${song.id}-${index}`}
              icon="music"
              title={song.title}
              subtitle={song.artist}
              onView={() => onSongSelect(song)}
              onDelete={onDeleteSong}
              idOrUrl={song.id}
              isDeletable={true}
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
