import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import type { Song } from "@/types/song";
import type { Artist } from "@/types/artist";
import { useSearchState } from "@/context/SearchStateContext";
import SongViewer from "@/components/SongViewer";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import { setLastSearchQuery } from '@/cache/implementations/search-cache';
import { getCachedSearchResults } from '@/cache/implementations/search-cache';
import { toSlug, fromSlug } from '@/utils/url-slug-utils';
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
  const [hasSearched, setHasSearched] = useState(false);
  const [artistInput, setArtistInput] = useState('');
  const [songInput, setSongInput] = useState('');
  const [prevArtistInput, setPrevArtistInput] = useState('');
  const [prevSongInput, setPrevSongInput] = useState('');
  const [submittedArtist, setSubmittedArtist] = useState('');
  const [submittedSong, setSubmittedSong] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: log hasSearched and searchState on every render
  console.log('[SearchTab] hasSearched:', hasSearched, 'searchState:', searchState);

  // Initialize input fields and search state from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist');
    const songParam = searchParams.get('song');

    if (artistParam || songParam) {
      const artist = artistParam ? fromSlug(artistParam) : '';
      const song = songParam ? fromSlug(songParam) : '';
      
      console.log('[SearchTab] Initializing from URL params:', { artist, song });
      
      // Set input fields
      setArtistInput(artist);
      setSongInput(song);
      setPrevArtistInput(artist);
      setPrevSongInput(song);
      setSubmittedArtist(artist);
      setSubmittedSong(song);

      // Set search state and let useSearchResults handle cache checking
      updateSearchState({ artist, song, results: [] });
      setLastSearchQuery(artist, song);
      setHasSearched(true);
      setShouldFetch(true);
    }
  }, [location.search, updateSearchState]);

  // Handlers for search form
  const handleInputChange = (artistValue: string, songValue: string) => {
    setArtistInput(artistValue);
    setSongInput(songValue);
    
    // Only update URL when an input is cleared (goes from non-empty to empty)
    const artistCleared = prevArtistInput && !artistValue;
    const songCleared = prevSongInput && !songValue;
    
    if (artistCleared || songCleared) {
      const params = new URLSearchParams();
      if (artistValue) params.set('artist', toSlug(artistValue));
      if (songValue) params.set('song', toSlug(songValue));
      navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
    
    // Update previous values for next comparison
    setPrevArtistInput(artistValue);
    setPrevSongInput(songValue);
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    // Clear artist/song selection state before new search
    setActiveArtist(null);
    setSelectedSongLocal(null);
    setLoading(true);
    setSubmittedArtist(artistValue);
    setSubmittedSong(songValue);
    updateSearchState({ artist: artistValue, song: songValue, results: [] });
    setLastSearchQuery(artistValue, songValue);
    setHasSearched(true);
    setShouldFetch(true);
    // Update the URL with the search query
    const params = new URLSearchParams();
    if (artistValue) params.set('artist', toSlug(artistValue));
    if (songValue) params.set('song', toSlug(songValue));
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`, { replace: location.pathname.startsWith('/search') });
  };

  // Handler for loading state changes from SearchResults
  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
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

  // Handler for going back to artist list from artist songs view
  const handleBackToArtistList = () => {
    setActiveArtist(null);
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
              artistValue={artistInput}
              songValue={songInput}
              onInputChange={handleInputChange}
              onSearchSubmit={handleSearchSubmit}
              loading={loading}
              showBackButton={!!activeArtist}
              onBackClick={activeArtist ? handleBackToArtistList : undefined}
              isSearchDisabled={!artistInput && !songInput}
              artistLoading={loading} // ensure disables back button when loading
            />
          </FormContainer>
          <div {...cyAttr('search-results-area')}>
            <SearchResults
              setMySongs={setMySongs}
              setActiveTab={setActiveTab}
              setSelectedSong={handleSongSelect}
              myChordSheets={myChordSheets}
              artist={hasSearched ? submittedArtist : searchState.artist}
              song={hasSearched ? submittedSong : searchState.song}
              filterArtist={activeArtist ? searchState.artist : artistInput}
              filterSong={songInput}
              activeArtist={activeArtist}
              onArtistSelect={handleArtistSelect}
              hasSearched={hasSearched}
              shouldFetch={shouldFetch}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SearchTab;
