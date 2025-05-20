import { SongData } from "@/types/song";
import ResultCard from "@/components/ResultCard";

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
      {artistSongs.map((song, index) => (
        <ResultCard
          key={`${song.path || 'path'}-${song.title || 'title'}-${index}`}
          icon="music"
          title={song.title}
          subtitle={song.artist}
          onView={() => onView(song)}
          onDelete={() => onAdd(song)}
          idOrUrl={song.id}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${song.title}`}
          viewButtonIcon="external"
          viewButtonLabel="Open"
          isDeletable={true}
        />
      ))}
    </div>
    <button className="mt-4 underline text-sm text-chord" onClick={onBack}>
      ← Back to search results
    </button>
  </>
);

export default ArtistSongsResult;
