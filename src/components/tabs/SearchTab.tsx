import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import type { Song } from "@/types/song";
import type { Artist } from "@/types/artist";
import { useSearchState } from "@/context/SearchStateContext";
import SongViewer from "@/components/SongViewer";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import { setLastSearchQuery } from '@/cache/implementations/search-cache';
import { toSlug } from '@/utils/url-slug-utils';
import { cyAttr } from '@/utils/test-utils/cy-attr';

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  myChordSheets: Song[];
}

// Local state for selectedSong (for viewing a song from search results)

const SearchTab: React.FC<SearchTabProps> = ({ setMySongs, setActiveTab, setSelectedSong, myChordSheets }) => {
  const { searchState, updateSearchState } = useSearchState();
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSongLocal] = useState<Song | null>(null);
  const [activeArtist, setActiveArtist] = useState<Artist | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // TDD: force to false for initial load
  const [searchKey, setSearchKey] = useState(0); // Used to force remount SearchResults
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: log hasSearched and searchState on every render
  console.log('[SearchTab] hasSearched:', hasSearched, 'searchState:', searchState);

  // Handlers for search form
  const handleInputChange = (artistValue: string, songValue: string) => {
    updateSearchState({ artist: artistValue, song: songValue });
    // Do NOT set hasSearched here!
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    setLoading(true);
    updateSearchState({ artist: artistValue, song: songValue, results: [] });
    setLastSearchQuery(artistValue, songValue);
    setHasSearched(true);
    setSearchKey(prev => prev + 1); // Force remount SearchResults
    // Update the URL with the search query
    const params = new URLSearchParams();
    if (artistValue) params.set('artist', toSlug(artistValue));
    if (songValue) params.set('song', toSlug(songValue));
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`, { replace: location.pathname.startsWith('/search') });
    setLoading(false);
  };

  // Handler for selecting a song from search results
  const handleSongSelect = (song: Song) => {
    setSelectedSongLocal(song);
  };

  // Handler for selecting an artist from search results
  const handleArtistSelect = (artist: Artist) => {
    setActiveArtist(artist);
  };

  // Handler for going back to search from SongViewer
  const handleBackToSearch = () => {
    setSelectedSongLocal(null);
  };

  return (
    <div className="space-y-4">
      {selectedSong ? (
        <SongViewer
          song={selectedSong}
          chordDisplayRef={null}
          onBack={handleBackToSearch}
          onDelete={() => {}}
          onUpdate={() => {}}
          backButtonLabel="Back to Search"
          hideDeleteButton={true}
        />
      ) : (
        <>
          <FormContainer>
            <SearchBar
              artistValue={searchState.artist}
              songValue={searchState.song}
              onInputChange={handleInputChange}
              onSearchSubmit={handleSearchSubmit}
              loading={loading}
              showBackButton={false}
              isSearchDisabled={!searchState.artist && !searchState.song}
            />
          </FormContainer>
          <div {...cyAttr('search-results-area')}>
            <SearchResults
              key={searchKey}
              setMySongs={setMySongs}
              setActiveTab={setActiveTab}
              setSelectedSong={handleSongSelect}
              myChordSheets={myChordSheets}
              artist={searchState.artist}
              song={searchState.song}
              filterArtist={searchState.artist}
              filterSong={searchState.song}
              activeArtist={activeArtist}
              onArtistSelect={handleArtistSelect}
              hasSearched={hasSearched}
              shouldFetch={hasSearched}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SearchTab;
