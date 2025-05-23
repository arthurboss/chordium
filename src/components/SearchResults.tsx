import React from 'react';
import { SongData } from "@/types/song";
import { Artist } from '@/types/artist';
import { useSearchResultsLogic } from '@/hooks/useSearchResultsLogic';
import SearchResultsStateHandler from '@/components/SearchResults/SearchResultsStateHandler';
import './custom-scrollbar.css';

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
  hasSearched?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  setMySongs, 
  artist, 
  song,
  filterArtist,
  filterSong,
  activeArtist,
  onArtistSelect,
  hasSearched,
}) => {
  const {
    stateData,
    memoizedArtists,
    filteredArtistSongs,
    handleView,
    handleAdd
  } = useSearchResultsLogic({
    artist,
    song,
    filterArtist,
    filterSong,
    activeArtist,
    setMySongs
  });

  return (
    <SearchResultsStateHandler
      stateData={stateData}
      artists={memoizedArtists}
      filteredSongs={filteredArtistSongs}
      filterSong={filterSong}
      onView={handleView}
      onAdd={handleAdd}
      onArtistSelect={onArtistSelect}
      hasSearched={hasSearched}
    />
  );
};

export default SearchResults;
