import React, { useCallback } from 'react';
import { SongData } from '@/types/song';
import { Artist } from '@/types/artist';
import ResultCard from '@/components/ResultCard';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from '@/constants/ui-constants';
import SearchResultsSection from '../SearchResultsSection';

interface ArtistSongsViewProps {
  activeArtist: Artist;
  filteredSongs: SongData[];
  filterSong: string;
  onView: (songData: SongData) => void;
  onAdd: (songId: string) => void;
}

export const ArtistSongsView: React.FC<ArtistSongsViewProps> = ({
  activeArtist,
  filteredSongs,
  filterSong,
  onView,
  onAdd
}) => {
  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: SongData }) => {
    return (
      <div style={style}>
        <ResultCard
          key={`${item.path || 'path'}-${index}`}
          icon="music"
          title={item.title}
          subtitle={item.artist}
          onView={() => onView(item)}
          onDelete={() => onAdd(item.id)}
          idOrUrl={item.id}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${item.title}`}
          viewButtonIcon="external"
          viewButtonLabel="View Chords"
          isDeletable={true}
          compact
        />
      </div>
    );
  }, [onView, onAdd]);

  return (
    <SearchResultsSection title={activeArtist.displayName}>
      {filteredSongs.length === 0 && filterSong && (
        <p className="mb-4 text-muted-foreground">No songs matching "{filterSong}"</p>
      )}
      <div className="w-full mb-4" style={{ height: '60vh' }}>
        <VirtualizedListWithArrow
          items={filteredSongs}
          itemHeight={CARD_HEIGHTS.RESULT_CARD}
          renderItem={renderSongItem}
          height="100%"
          showArrow={filteredSongs.length > 3}
        />
      </div>
    </SearchResultsSection>
  );
};

export default ArtistSongsView;
