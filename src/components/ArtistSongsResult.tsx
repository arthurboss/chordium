import { SongData } from "@/types/song";
import ResultCard from "@/components/ResultCard";
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import { ListChildComponentProps } from 'react-window';
import React, { useCallback } from 'react';
import { CARD_HEIGHTS } from "@/constants/ui-constants";

interface ArtistSongsResultProps {
  artistSongs: SongData[];
  onView: (song: SongData) => void;
  onAdd: (song: SongData) => void;
  onBack: () => void;
}

const ArtistSongsResult = ({ artistSongs, onView, onAdd, onBack }: ArtistSongsResultProps) => {
  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: SongData }) => {
    return (
      <div style={style}>
        <ResultCard
          key={`${item.path || 'path'}-${item.title || 'title'}-${index}`}
          icon="music"
          title={item.title}
          subtitle={item.artist}
          onView={() => onView(item)}
          onDelete={() => onAdd(item)}
          idOrUrl={item.id}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${item.title}`}
          viewButtonIcon="external"
          viewButtonLabel="Open"
          isDeletable={true}
        />
      </div>
    );
  }, [onView, onAdd]);

  // Use regular grid layout for small number of items
  if (artistSongs.length < 10) {
    return (
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
  }

  // Use virtualized list for larger number of items
  return (
    <>
      <h2 className="text-lg font-medium mb-4">
        {artistSongs.length} songs for artist
        <span className="block text-sm text-muted-foreground mt-1">
          Songs from Cifra Club. Click "+" to add to your songs.
        </span>
      </h2>
      <div className="w-full mb-4" style={{ height: '60vh' }}>
        <VirtualizedListWithArrow
          items={artistSongs}
          itemHeight={CARD_HEIGHTS.RESULT_CARD}
          renderItem={renderSongItem}
          showArrow={artistSongs.length > 5}
        />
      </div>
      <button className="mt-4 underline text-sm text-chord" onClick={onBack}>
        ← Back to search results
      </button>
    </>
  );
};

export default ArtistSongsResult;
