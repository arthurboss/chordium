import { SongData } from "@/types/song";
import SongCard from "@/components/SongCard";

interface ArtistSongsResultProps {
  artistSongs: SongData[];
  onView: (song: SongData) => void;
  onAdd: (song: SongData) => void;
  onBack: () => void;
}

const ArtistSongsResult = ({ artistSongs, onView, onAdd, onBack }: ArtistSongsResultProps) => (
  <>
    <h2 className="text-lg font-medium mb-4">
      {artistSongs.length} songs for artist
      <span className="block text-sm text-muted-foreground mt-1">
        Songs from Cifra Club. Click "+" to add to your songs.
      </span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {artistSongs.map(song => (
        <SongCard
          key={song.id}
          song={song}
          onView={onView}
          onDelete={() => onAdd(song)}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${song.title}`}
          viewButtonIcon="external"
          viewButtonLabel="Open"
        />
      ))}
    </div>
    <button className="mt-4 underline text-sm text-chord" onClick={onBack}>
      ← Back to search results
    </button>
  </>
);

export default ArtistSongsResult;
