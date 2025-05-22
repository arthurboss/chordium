import React, { useMemo, useCallback } from 'react';
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult } from "@/utils/search-results-utils";
import SearchResultsLayout from "@/components/SearchResultsLayout";
import ResultCard from "@/components/ResultCard";
import { Artist } from '@/types/artist';
import { useArtistSongs } from '@/hooks/useArtistSongs';
import { filterSongsByTitle } from '@/utils/song-filter-utils';
import './custom-scrollbar.css';
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import { ListChildComponentProps } from 'react-window';
import { CARD_HEIGHTS } from "@/constants/ui-constants";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  activeArtist: Artist | null;
  onArtistSelect: (artist: Artist) => void;
  onBackToArtistList?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  setMySongs, 
  artist, 
  song,
  filterArtist,
  filterSong,
  activeArtist,
  onArtistSelect,
  onBackToArtistList
}) => {
  const { artists, songs, loading, error } = useSearchResults(artist, song, filterArtist, filterSong);

  // Use custom hook for artist songs
  const { songs: artistSongs, loading: artistSongsLoading, error: artistSongsError } = useArtistSongs(activeArtist);

  const memoizedSongs = useMemo(() => activeArtist ? artistSongs : songs, [songs, artistSongs, activeArtist]);
  const memoizedArtists = useMemo(() => artists, [artists]);

  // Use util for filtering
  const filteredArtistSongs = useMemo(() => {
    if (!activeArtist || !artistSongs.length) return [];
    return filterSongsByTitle(artistSongs, filterSong);
  }, [activeArtist, artistSongs, filterSong]);

  const handleView = useCallback((songData: SongData) => {
    window.open(songData.path, '_blank');
  }, []);

  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(item => formatSearchResult(item).id === songId);
    if (item) {
      const songData = formatSearchResult(item);
      setMySongs(prev => [...prev, songData]);
    }
  }, [setMySongs, memoizedSongs]);

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: SongData }) => {
    return (
      <div style={style}>
        <ResultCard
          key={`${item.path || 'path'}-${item.title || 'title'}-${index}`}
          icon="music"
          title={item.title}
          subtitle={item.artist}
          onView={() => handleView(item)}
          onDelete={() => handleAdd(item.id)}
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
  }, [handleView, handleAdd]);

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  if (artistSongsLoading) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4">Loading songs for "{activeArtist?.displayName}"...</div>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (artistSongsError) {
    return (
      <div className="p-8 flex flex-col items-center">
        <div className="text-red-500 mb-4">
          Error loading songs for "{activeArtist?.displayName}": {artistSongsError}
        </div>
      </div>
    );
  }

  if (activeArtist && artistSongs.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl text-center font-semibold mb-4">{activeArtist.displayName}</h2>
        {filteredArtistSongs.length === 0 && filterSong && (
          <p className="mb-4 text-muted-foreground">No songs matching "{filterSong}"</p>
        )}
        <div className="w-full mb-4" style={{ height: '60vh' }}>
          <VirtualizedListWithArrow
            items={filteredArtistSongs}
            itemHeight={CARD_HEIGHTS.RESULT_CARD}
            renderItem={renderSongItem}
            height="100%"
            showArrow={filteredArtistSongs.length > 3}
          />
        </div>
      </div>
    );
  }

  return (
    <SearchResultsLayout
      artists={memoizedArtists}
      songs={[]}
      onView={handleView}
      onDelete={handleAdd}
      onArtistSelect={onArtistSelect}
    />
  );
};

export default SearchResults;
