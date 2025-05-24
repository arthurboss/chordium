import React, { useCallback } from 'react';
import { SongData } from '@/types/song';
import { Artist } from '@/types/artist';
import { SearchResultItem } from '@/utils/search-result-item';
import { formatSearchResult } from '@/utils/format-search-result';
import ResultCard from '@/components/ResultCard';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from '@/constants/ui-constants';
import SearchResultsSection from '../SearchResultsSection';
import '@/components/custom-scrollbar.css';

interface SongsViewProps {
  // For artist-based searches
  activeArtist?: Artist;
  filteredSongs?: SongData[];
  // For song-only searches
  songs?: SearchResultItem[];
  filterSong: string;
  onView: (songData: SongData | SearchResultItem) => void;
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
  const displaySongs: (SongData | SearchResultItem)[] = isArtistSearch ? filteredSongs : songs;
  const title = isArtistSearch ? activeArtist!.displayName : 'Search Results';

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: SongData | SearchResultItem }) => {
    // Type guard to check if item is SongData or SearchResultItem
    const isSongData = 'id' in item;
    
    let songTitle: string;
    let songArtist: string;
    let songId: string;
    
    if (isSongData) {
      // Handle SongData
      songTitle = item.title;
      songArtist = item.artist;
      songId = item.id;
    } else {
      // Handle SearchResultItem - convert to SongData for consistent handling
      const converted = formatSearchResult(item);
      songTitle = converted.title;
      songArtist = converted.artist;
      songId = item.url; // Use URL as identifier for SearchResultItem
    }

    return (
      <div style={style}>
        <ResultCard
          key={`${isSongData ? item.path || 'path' : item.url}-${index}`}
          icon="music"
          title={songTitle}
          subtitle={songArtist}
          onView={() => onView(item)}
          onDelete={() => onAdd(songId)}
          idOrUrl={songId}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${songTitle}`}
          viewButtonIcon="external"
          viewButtonLabel="View Chords"
          isDeletable={true}
          compact
        />
      </div>
    );
  }, [onView, onAdd]);

  return (
    <SearchResultsSection title={title}>
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
