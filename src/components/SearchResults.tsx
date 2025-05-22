import React, { useMemo, useCallback, useState } from 'react';
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult } from "@/utils/search-results-utils";
import SearchResultsLayout from "@/components/SearchResultsLayout";
import ResultCard from "@/components/ResultCard";
import { Artist } from '@/types/artist';
import { fetchArtistSongs } from '@/utils/artist-utils';
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
}

/**
 * Main SearchResults component that fetches and displays search results
 * Uses extracted components for better separation of concerns and performance
 */
const SearchResults: React.FC<SearchResultsProps> = ({ 
  setMySongs, 
  artist, 
  song,
  filterArtist,
  filterSong
}) => {
  const { artists, songs, loading, error } = useSearchResults(artist, song, filterArtist, filterSong);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistSongs, setArtistSongs] = useState<SongData[]>([]);
  const [artistSongsLoading, setArtistSongsLoading] = useState<boolean>(false);
  const [artistSongsError, setArtistSongsError] = useState<string | null>(null);

  const memoizedSongs = useMemo(() => selectedArtist ? artistSongs : songs, [songs, artistSongs, selectedArtist]);
  const memoizedArtists = useMemo(() => artists, [artists]);
  
  // Filter artist songs based on filterSong if an artist is selected
  const filteredArtistSongs = useMemo(() => {
    if (!selectedArtist || !artistSongs.length) return [];
    
    if (!filterSong) return artistSongs;
    
    const normalizedFilter = filterSong.toLowerCase();
    return artistSongs.filter(song => 
      song.title.toLowerCase().includes(normalizedFilter)
    );
  }, [selectedArtist, artistSongs, filterSong]);
  
  // Open song in new tab
  const handleView = useCallback((songData: SongData) => {
    window.open(songData.path, '_blank');
  }, []);
  
  // Add song to "My Songs"
  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    
    const item = memoizedSongs.find(item => formatSearchResult(item).id === songId);
    if (item) {
      const songData = formatSearchResult(item);
      setMySongs(prev => [...prev, songData]);
    }
  }, [setMySongs, memoizedSongs]);

  // Handle artist selection
  const handleArtistSelect = useCallback(async (artist: Artist) => {
    setSelectedArtist(artist);
    setArtistSongsLoading(true);
    setArtistSongsError(null);
    
    try {
      console.log(`Fetching songs for artist: ${artist.path}`);
      const songs = await fetchArtistSongs(artist.path);
      console.log(`Fetched ${songs.length} songs for artist: ${artist.displayName}`);
      setArtistSongs(songs);
    } catch (err) {
      console.error('Error fetching artist songs:', err);
      setArtistSongsError(err instanceof Error ? err.message : 'Failed to fetch artist songs');
      setArtistSongs([]);
    } finally {
      setArtistSongsLoading(false);
    }
  }, []);

  // Return to artist list
  const handleBackToArtists = useCallback(() => {
    setSelectedArtist(null);
    setArtistSongs([]);
  }, []);

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
        <div className="mb-4">Loading songs for "{selectedArtist?.displayName}"...</div>
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
          Error loading songs for "{selectedArtist?.displayName}": {artistSongsError}
        </div>
        <button 
          onClick={handleBackToArtists}
          className="text-chord hover:underline mt-2"
        >
          ← Back to artist list
        </button>
      </div>
    );
  }

  // Now render the appropriate content based on whether an artist is selected
  if (selectedArtist && artistSongs.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl text-center font-semibold mb-4">{selectedArtist.displayName}</h2>
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
        
        <button 
          className="mt-2 mb-2 text-chord hover:underline flex items-center gap-1 text-sm"
          onClick={handleBackToArtists}
        >
          ← Back to artist results
        </button>
      </div>
    );
  }

  return (
    <SearchResultsLayout
      artists={memoizedArtists}
      songs={[]} // Hide songs from results for backend testing
      onView={handleView}
      onDelete={handleAdd}
      onArtistSelect={handleArtistSelect}
    />
  );
};

export default SearchResults;
