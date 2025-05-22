import React, { useMemo, useCallback } from 'react';
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult } from "@/utils/search-results-utils";
import SearchResultsLayout from "@/components/SearchResultsLayout";
import './custom-scrollbar.css';

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

  const memoizedSongs = useMemo(() => songs, [songs]);
  const memoizedArtists = useMemo(() => artists, [artists]);
  
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

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <SearchResultsLayout
      artists={memoizedArtists}
      songs={[]} // Hide songs from results for backend testing
      onView={() => {}} // No-op handler
      onDelete={() => {}} // No-op handler
    />
  );
};

export default SearchResults;
