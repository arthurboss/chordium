import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import type { Song } from "@/types/song";
import type { Artist } from "@/types/artist";
import { useSearchState } from "@/context/SearchStateContext";
import SongViewer from "@/components/SongViewer";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/search/components/SearchResults";
import { setLastSearchQuery } from '@/cache/implementations/search-cache';
import { toSlug, fromSlug } from '@/utils/url-slug-utils';
import { cyAttr } from '@/utils/test-utils/cy-attr';
import { useArtistNavigation } from '@/search/hooks/useArtistNavigation';
import { storeOriginalSearchUrl } from '@/hooks/use-navigation-history';

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}

// Local state for selectedSong (for viewing a song from search results)

const SearchTab: React.FC<SearchTabProps> = ({ setMySongs, setActiveTab, setSelectedSong }) => {
  const { searchState, updateSearchState } = useSearchState();
  const [loading, setLoading] = useState(false);
  const [selectedSongLocal, setSelectedSongLocal] = useState<Song | null>(null);
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

  // Store original URL for preservation when navigating away and back
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Only store URLs that are search-related:
    // 1. Artist pages (not basic app tabs)
    // 2. Search pages with parameters
    const isBasicAppTab = location.pathname === '/my-chord-sheets' || 
                         location.pathname === '/upload' || 
                         (location.pathname === '/search' && !location.search);
    
    if (!isBasicAppTab) {
      storeOriginalSearchUrl(currentPath);
    }
  }, [location.pathname, location.search]);

  // Initialize input fields and search state from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist');
    const songParam = searchParams.get('song');

    if ((artistParam || songParam) && !isInitialized.current) {
      const artist = artistParam ? fromSlug(artistParam) : '';
      const song = songParam ? fromSlug(songParam) : '';
      
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
    
    // Always update the input fields so the UI shows what user types
    setArtistInput(artistValue);
    setSongInput(songValue);
    
    // Only update URL when an input is cleared (goes from non-empty to empty)
    const artistCleared = prevArtistInput && !artistValue;
    const songCleared = prevSongInput && !songValue;
    
    if (artistCleared || songCleared) {
      const params = new URLSearchParams();
      if (artistValue) params.set('artist', toSlug(artistValue));
      if (songValue) params.set('song', toSlug(songValue));
      const searchUrl = params.toString() ? `/search?${params.toString()}` : '/search';
      navigate(searchUrl, { replace: true });
    }
    
    // Update previous values for next comparison
    setPrevArtistInput(artistValue);
    setPrevSongInput(songValue);
    // --- FIX: Reset shouldFetch to false on input change ---
    setShouldFetch(false);
  }, [prevArtistInput, prevSongInput, navigate]);

  const handleSearchSubmit = useCallback((artistValue: string, songValue: string) => {
    
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
    const searchUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    navigate(searchUrl, { replace: location.pathname.startsWith('/search') });
  }, [updateSearchState, navigate, location.pathname]);

  // Handler for loading state changes from SearchResults
  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  // Handler for selecting a song from search results
  const handleSongSelect = useCallback((song: Song) => {
    setSelectedSongLocal(song);
  }, []);

  // Import the artist navigation hook
  const { navigateToArtist, navigateBackToSearch, isOnArtistPage, getCurrentArtistPath } = useArtistNavigation();

  // Handle direct artist URL access (e.g., /jeremy-camp)
  useEffect(() => {
    if (isOnArtistPage() && !isInitialized.current) {
      const artistPath = getCurrentArtistPath();
      if (artistPath) {
        const artistName = fromSlug(artistPath);
        
        // Set up the artist as if it was selected from search results
        const artist: Artist = {
          displayName: artistName,
          path: artistPath,
          songCount: null
        };
        
        setActiveArtist(artist);
        setArtistInput(artistName);
        setPrevArtistInput(artistName);
        setSubmittedArtist(artistName);
        setHasSearched(true);
        setShouldFetch(true);
        isInitialized.current = true;
      }
    }
  }, [location.pathname, isOnArtistPage, getCurrentArtistPath]);

  // Handler for selecting an artist from search results
  const handleArtistSelect = useCallback((artist: Artist) => {
    setActiveArtist(artist);
    // Navigate to artist page
    navigateToArtist(artist);
  }, [navigateToArtist]);

  // Handler for going back to search from SongViewer
  const handleBackToSearch = useCallback(() => {
    setSelectedSongLocal(null);
  }, []);

  // Handler for going back to artist list from artist songs view
  const handleBackToArtistList = useCallback(() => {
    setActiveArtist(null);
    // Navigate back to search results
    navigateBackToSearch();
  }, [navigateBackToSearch]);

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

  return (
    <div className="space-y-4">
      {selectedSongLocal ? (
        <SongViewer
          song={{
            song: selectedSongLocal,
            chordSheet: {
              title: selectedSongLocal.title || '',
              artist: selectedSongLocal.artist || '',
              songChords: '',
              songKey: '',
              guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'] as const,
              guitarCapo: 0
            }
          }}
          chordDisplayRef={null}
          onBack={handleBackToSearch}
          onDelete={() => {}}
          onUpdate={() => {}}
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
