import React, { useCallback } from 'react';
import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import ResultCard from '@/components/ResultCard';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from '@/constants/ui-constants';
import SearchResultsSection from '../SearchResultsSection';
import { cyAttr } from '@/utils/test-utils';
import '@/components/custom-scrollbar.css';

interface SongsViewProps {
  // For artist-based searches
  activeArtist?: Artist;
  filteredSongs?: Song[];
  // For song-only searches
  songs?: Song[];
  filterSong: string;
  onView: (songData: Song) => void;
  onAdd: (songId: string) => void;
  searchType?: 'artist' | 'song';
}

export const SongsView: React.FC<SongsViewProps> = ({
  activeArtist,
  filteredSongs = [],
  songs = [],
  filterSong,
  onView,
  onAdd,
  searchType = 'artist'
}) => {
  // Determine which data source to use
  const isArtistSearch = searchType === 'artist' && activeArtist;
  const displaySongs: Song[] = isArtistSearch ? filteredSongs : songs;
  const title = isArtistSearch ? activeArtist?.displayName : 'Search Results';

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = displaySongs[index];
    return (
      <div className="virtualized-item" style={style}>
        <ResultCard
          key={`${item.path}-${index}`}
          icon="music"
          title={item.title}
          subtitle={item.artist}
          onView={() => onView(item)}
          onDelete={() => onAdd(item.path)}
          path={item.path}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${item.title}`}
          viewButtonIcon="external"
          viewButtonLabel="View Chords"
          isDeletable={true}
          compact
        />
      </div>
    );
  }, [onView, onAdd, displaySongs]);

  return (
    <SearchResultsSection title={title} {...cyAttr("songs-view")}>
      {displaySongs.length === 0 && filterSong && (
        <p className="mb-4 text-muted-foreground">No songs matching "{filterSong}"</p>
      )}
      <div className="w-full mb-4 songs-view-height">
        <VirtualizedListWithArrow
          items={displaySongs}
          itemHeight={CARD_HEIGHTS.RESULT_CARD}
          renderItem={renderSongItem}
          height="100%"
          showArrow={displaySongs.length > 3}
        />
      </div>
    </SearchResultsSection>
  );
};

export default SongsView;
