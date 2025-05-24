import React, { useCallback } from 'react';
import { ArtistSong } from '@/types/artistSong';
import { Artist } from '@/types/artist';
import ResultCard from '@/components/ResultCard';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from '@/constants/ui-constants';
import SearchResultsSection from '../SearchResultsSection';

interface ArtistSongsViewProps {
  activeArtist: Artist;
  filteredSongs: ArtistSong[];
  filterSong: string;
  onView: (songData: ArtistSong) => void;
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
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: ArtistSong }) => {
    return (
      <div style={style}>
        <ResultCard
          key={`${item.path || 'path'}-${index}`}
          icon="music"
          title={item.title}
          subtitle={activeArtist.displayName}
          onView={() => onView(item)}
          onDelete={() => onAdd(item.path)}
          idOrUrl={item.path}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${item.title}`}
          viewButtonIcon="external"
          viewButtonLabel="View Chords"
          isDeletable={true}
          compact
        />
      </div>
    );
  }, [onView, onAdd, activeArtist.displayName]);

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
