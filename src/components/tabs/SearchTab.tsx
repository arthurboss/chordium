import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const isInitialized = useRef(false);

  console.log('[SearchTab] RENDER:', { 
    hasSearched, 
    artistInput, 
    songInput, 
    submittedArtist, 
    submittedSong, 
    shouldFetch,
    activeArtist: activeArtist?.displayName,
    selectedSong: selectedSong?.title
  });

  // Initialize input fields and search state from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist');
    const songParam = searchParams.get('song');

    if ((artistParam || songParam) && !isInitialized.current) {
      const artist = artistParam ? fromSlug(artistParam) : '';
      const song = songParam ? fromSlug(songParam) : '';
      
      console.log('[SearchTab] INITIALIZING FROM URL:', { artist, song });
      
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
      isInitialized.current = true;
    }
  }, [location.search, updateSearchState]);

  // Handlers for search form - memoized to prevent re-renders
  const handleInputChange = useCallback((artistValue: string, songValue: string) => {
    console.log('[SearchTab] INPUT CHANGE:', { artistValue, songValue, activeArtist: activeArtist?.displayName });
    
    // Always update the input fields so the UI shows what user types
    setArtistInput(artistValue);
    setSongInput(songValue);
    
    // Only update URL when an input is cleared (goes from non-empty to empty)
    const artistCleared = prevArtistInput && !artistValue;
    const songCleared = prevSongInput && !songValue;
    
    if (artistCleared || songCleared) {
      console.log('[SearchTab] INPUT CLEARED - Updating URL');
      const params = new URLSearchParams();
      if (artistValue) params.set('artist', toSlug(artistValue));
      if (songValue) params.set('song', toSlug(songValue));
      navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
    
    // Update previous values for next comparison
    setPrevArtistInput(artistValue);
    setPrevSongInput(songValue);
    // --- FIX: Reset shouldFetch to false on input change ---
    setShouldFetch(false);
  }, [prevArtistInput, prevSongInput, navigate]);

  const handleSearchSubmit = useCallback((artistValue: string, songValue: string) => {
    console.log('[SearchTab] SEARCH SUBMIT:', { artistValue, songValue });
    
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
  }, [updateSearchState, navigate, location.pathname]);

  // Handler for loading state changes from SearchResults
  const handleLoadingChange = useCallback((isLoading: boolean) => {
    console.log('[SearchTab] LOADING CHANGE:', isLoading);
    setLoading(isLoading);
  }, []);

  // Handler for selecting a song from search results
  const handleSongSelect = useCallback((song: Song) => {
    console.log('[SearchTab] SONG SELECTED:', song.title);
    setSelectedSongLocal(song);
  }, []);

  // Handler for selecting an artist from search results
  const handleArtistSelect = useCallback((artist: Artist) => {
    console.log('[SearchTab] ARTIST SELECTED:', artist.displayName);
    setActiveArtist(artist);
  }, []);

  // Handler for going back to search from SongViewer
  const handleBackToSearch = useCallback(() => {
    console.log('[SearchTab] BACK TO SEARCH');
    setSelectedSongLocal(null);
  }, []);

  // Handler for going back to artist list from artist songs view
  const handleBackToArtistList = useCallback(() => {
    console.log('[SearchTab] BACK TO ARTIST LIST');
    setActiveArtist(null);
  }, []);

  // Handler for Clear Search button
  const handleClearSearch = useCallback(() => {
    setArtistInput('');
    setSongInput('');
    setPrevArtistInput('');
    setPrevSongInput('');
    setSubmittedArtist('');
    setSubmittedSong('');
    setHasSearched(false);
    setShouldFetch(false);
    setActiveArtist(null);
    setSelectedSongLocal(null);
    setLoading(false);
    updateSearchState({ artist: '', song: '', results: [] });
    navigate('/search', { replace: true });
  }, [updateSearchState, navigate]);

  // Disable clear if both fields are empty and no search performed
  const clearDisabled = !artistInput && !songInput && !hasSearched;

  console.log('[SearchTab] FINAL STATE:', { 
    hasSearched, 
    shouldFetch, 
    loading, 
    activeArtist: activeArtist?.displayName,
    selectedSong: selectedSong?.title
  });

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
              onClearSearch={handleClearSearch}
              clearDisabled={clearDisabled}
              artistDisabled={!!activeArtist}
            />
          </FormContainer>
          {hasSearched && (
            <div {...cyAttr('search-results-area')}>
              <SearchResults
                setMySongs={setMySongs}
                setActiveTab={setActiveTab}
                setSelectedSong={handleSongSelect}
                myChordSheets={myChordSheets}
                artist={hasSearched ? submittedArtist : searchState.artist}
                song={hasSearched ? submittedSong : searchState.song}
                filterArtist={activeArtist ? submittedArtist : artistInput}
                filterSong={songInput}
                activeArtist={activeArtist}
                onArtistSelect={handleArtistSelect}
                hasSearched={hasSearched}
                shouldFetch={shouldFetch}
                onLoadingChange={handleLoadingChange}
                onFetchComplete={() => setShouldFetch(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchTab;
