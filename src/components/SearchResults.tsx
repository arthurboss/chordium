// filepath: /Users/arthurboss/projects/chordium/src/components/SearchResults.tsx
import React from 'react';
import SongCard from "./SongCard";
import ArtistCard from "./ArtistCard";
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult, formatArtistResult, getQueryDisplayText } from "@/utils/search-results-utils";
import { getSearchParamsType } from "@/utils/search-utils";
import "@/components/ui/loading-spinner.css";
import { useAddToMySongs } from "@/hooks/useAddToMySongs";
import { useArtistSongs } from "@/hooks/useArtistSongs";
import ArtistSongsResult from "./ArtistSongsResult";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import { storeChordUrl } from "@/utils/session-storage-utils";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
  artistLoading: boolean;
  setArtistLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchResults = ({ setMySongs, setActiveTab, artistLoading: artistLoadingProp, setArtistLoading, onLoadingChange }: SearchResultsProps & { onLoadingChange?: (loading: boolean) => void }) => {
  const { results, loading, error, searchParams } = useSearchResults();
  const artistLoadingExternal = artistLoadingProp;
  const addToMySongs = useAddToMySongs(setMySongs, setActiveTab); // Correctly initialize addToMySongs

  const { 
    artistSongs, 
    artistLoading, 
    artistError, 
    handleArtistClick, 
    resetArtistSongs 
  } = useArtistSongs(setArtistLoading ? { setParentLoading: setArtistLoading } : undefined); // Pass setArtistLoading correctly
  
  // Get search query for key to force re-render when search changes
  const artist = searchParams.get('artist') || '';
  const song = searchParams.get('song') || '';
  // Include the timestamp parameter to ensure we re-render when the same search is submitted again
  const timestamp = searchParams.get('_t') || Date.now().toString();
  const searchKey = `${artist}:${song}:${timestamp}`;

  // Log component props/state on every render
  console.log(
    `SearchResults RENDER [${searchKey}]: Results length: ${results?.length}, Loading: ${loading}, ArtistLoading (hook): ${artistLoading}, ArtistLoading (prop): ${artistLoadingExternal}, Error: ${Boolean(error)}, ArtistError: ${Boolean(artistError)}`
  );

  // Enhanced debugging logs
  React.useEffect(() => {
    console.log('SearchResults component - search parameters:', { 
      artist, 
      song, 
      timestamp, 
      searchKey, 
      resultsCount: results?.length || 0,
      hasResults: results && results.length > 0,
      loading,
      error
    });
    
    // Log results data for debugging if available
    if (results && results.length > 0) {
      console.log('SearchResults - results sample:', 
        results.slice(0, 2), // Show only first couple of results to avoid log clutter
        `(total: ${results.length})`
      );
    }
  }, [artist, song, timestamp, searchKey, results, loading, error]);

  React.useEffect(() => {
    if (onLoadingChange) onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  const isLoading = loading || artistLoading || artistLoadingExternal;

  const handleViewSong = (song: SongData) => {
    // Extract artist and song from URL
    try {
      const url = new URL(song.path);
      const path = url.pathname.replace(/^\/|\/$/g, '');
      const segments = path.split('/');
      
      if (segments.length >= 2) {
        const artistSlug = segments[0];
        const songSlug = segments[1];
        // Store the cifra club URL in sessionStorage using our utility
        storeChordUrl(artistSlug, songSlug, song.path);
        window.location.href = `/chord/${artistSlug}/${songSlug}`;
      } else {
        // Fallback to original behavior if URL structure is unexpected
        window.open(song.path, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      // Fallback to original behavior if URL parsing fails
      window.open(song.path, "_blank", "noopener,noreferrer");
    }
  };

  // Debug log rendering conditions
  React.useEffect(() => {
    console.log('SearchResults - render conditions:', {
      isLoading,
      hasArtistSongs: Boolean(artistSongs && artistSongs.length > 0),
      hasError: Boolean(error || artistError),
      showEmptyState: !loading && !isLoading && (!results || results.length === 0),
      hasResults: results && results.length > 0
    });
  }, [isLoading, artistSongs, error, artistError, loading, results]);

  // Log state right before renderers evaluation
  console.log('SearchResults - Pre-renderers check. Results:', JSON.stringify(results), 'Loading:', loading, 'IsLoading (combined):', isLoading);

  // Declarative, prioritized render conditions for performance and maintainability
  const renderers = [
    {
      condition: isLoading,
      render: () => <LoadingState message={artistLoading ? 'Loading artist songs...' : 'Searching chord sheets...'} />
    },
    {
      condition: Boolean(artistSongs && artistSongs.length > 0),
      render: () => (
        <ArtistSongsResult
          artistSongs={artistSongs}
          onView={handleViewSong}
          onAdd={addToMySongs} // Use the initialized addToMySongs
          onBack={resetArtistSongs}
        />
      )
    },
    {
      condition: Boolean(error || artistError),
      render: () => <ErrorState error={error || artistError || ''} />
    },
    {
      condition: !isLoading && Array.isArray(results) && results.length === 0,
      render: () => <EmptyState searchParams={searchParams} />
    }
  ];

  const matchedRenderer = renderers.find(r => r.condition);

  if (matchedRenderer) return matchedRenderer.render();

  // Default: show search results (this should always render if we have results)
  console.log('SearchResults - rendering results list with', results?.length || 0, 'items');
  
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">
        {results?.length || 0} results for {getQueryDisplayText(searchParams)}
        <span className="block text-sm text-muted-foreground mt-1">
          Results from Cifra Club. Click "+" to add to your songs.
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results && results.map(item => {
          const type = getSearchParamsType(searchParams);
          if (type === 'artist') {
            const artistData = formatArtistResult(item);
            return (
              <ArtistCard
                key={artistData.url}
                artistName={artistData.name}
                artistUrl={artistData.url}
                onView={handleArtistClick}
                viewButtonIcon="external"
                viewButtonLabel="See Artist Songs"
              />
            );
          }
          const songData = formatSearchResult(item);
          return (
            <SongCard
              key={songData.id}
              song={songData}
              onView={handleViewSong}
              onDelete={() => addToMySongs(songData)} // Use the initialized addToMySongs
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="view"
              viewButtonLabel="View Chords"
            />
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
