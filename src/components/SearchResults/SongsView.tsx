import React, { useCallback } from 'react';
import { Song } from '@/types/song';
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
  filteredSongs?: Song[] | Song[];
  // For song-only searches
  songs?: SearchResultItem[];
  filterSong: string;
  onView: (songData: Song | SearchResultItem | Song) => void;
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
  const displaySongs: (Song | SearchResultItem | Song)[] = isArtistSearch ? filteredSongs : songs;
  const title = isArtistSearch ? activeArtist!.displayName : 'Search Results';

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: Song | SearchResultItem | Song }) => {
    // Type guards to check the type of item
    const isSongData = 'id' in item;
    const isArtistSong = 'path' in item && 'title' in item && !('url' in item);
    
    let songTitle: string;
    let songArtist: string;
    let songId: string;
    
    if (isSongData) {
      // Handle Song with id and artist properties
      songTitle = item.title;
      songArtist = item.artist;
      songId = item.id;
    } else if (isArtistSong) {
      // Handle Song from artist search (path + title only)
      songTitle = item.title;
      songArtist = activeArtist?.displayName || 'Unknown Artist';
      songId = item.path;
    } else {
      // Handle SearchResultItem - convert to Song for consistent handling
      const converted = formatSearchResult(item);
      songTitle = converted.title;
      songArtist = activeArtist?.displayName || 'Unknown Artist'; // Use activeArtist for SearchResultItems too
      songId = item.url; // Use URL as identifier for SearchResultItem
    }

    return (
      <div className="virtualized-item" style={style}>
        <ResultCard
          key={`${isSongData ? item.id : isArtistSong ? item.path : item.url}-${index}`}
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
  }, [onView, onAdd, activeArtist?.displayName]);

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
