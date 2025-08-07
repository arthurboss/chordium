import React, { useCallback } from 'react';
import { Artist, Song } from '@chordium/types';
import ResultCard from '@/components/ResultCard';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from '@/constants/ui-constants';
import { SearchResultsSection } from '.';
import { cyAttr } from '@/utils/test-utils';
import '@/components/custom-scrollbar.css';

interface SongsViewProps {
  // For artist-based searches
  activeArtist?: Artist;
  filteredSongs?: Song[];
  // For song-only searches
  songs?: Song[];
  filterSong: string;
  filterArtist?: string; // <-- add this
  onView: (songData: Song) => void;
  onAdd: (songId: string) => void;
  searchType?: 'artist' | 'song';
}

export const SongsView: React.FC<SongsViewProps> = ({
  activeArtist,
  filteredSongs = [],
  songs = [],
  filterSong,
  filterArtist = '', // <-- default
  onView,
  onAdd,
  searchType = 'artist'
}) => {
  // Determine which data source to use
  const isArtistSearch = searchType === 'artist' && activeArtist;
  let displaySongs: Song[] = isArtistSearch ? filteredSongs : songs;
  const title = isArtistSearch ? activeArtist?.displayName : 'Search Results';

  // Local filter by artist for song-only search
  if (searchType === 'song' && filterArtist) {
    displaySongs = displaySongs.filter(song =>
      song.artist.toLowerCase().includes(filterArtist.toLowerCase())
    );
  }

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = displaySongs[index];
    return (
      <div className="virtualized-item" style={style}>
        <ResultCard
          key={`${item.path}-${index}`}
          searchType="song"
          title={item.title}
          subtitle={item.artist}
          path={item.path}
          onClick={() => onView(item)}
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
