import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SongCard from "./SongCard";
import ArtistCard from "./ArtistCard";
import { SongData } from "@/types/song";
import { handleSaveNewSong } from "@/utils/song-actions";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult, formatArtistResult, getQueryDisplayText } from "@/utils/search-results-utils";
import { getSearchParamsType } from "@/utils/search-utils";
import "@/components/ui/loading-spinner.css";
import { useState } from "react";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchResults = ({ setMySongs, setActiveTab }: SearchResultsProps) => {
  const { results, loading, error, searchParams } = useSearchResults();
  const navigate = useNavigate();
  const [artistSongs, setArtistSongs] = useState<SongData[] | null>(null);

  // Handle viewing a song, which will navigate to view chords externally
  const handleViewSong = (song: SongData) => {
    window.open(song.path, "_blank", "noopener,noreferrer");
  };

  // Handle adding a song to the user's saved songs
  const handleAddToMySongs = async (song: SongData) => {
    if (setMySongs && setActiveTab) {
      try {
        // We just want to save the song we have
        // No need for conditional check since we're always proceeding
        
        {
          const content = `# ${song.title || 'Untitled Song'}
## ${song.artist || 'Unknown Artist'}

[Verse]
This is a placeholder for chord content that would be
fetched from ${song.path}

[Chorus]
G         C            D
Placeholder chord notation
Em        C            D
For the actual song chords
`;

          handleSaveNewSong(
            content, 
            song.title, 
            setMySongs, 
            navigate, 
            setActiveTab
          );
        }
      } catch (error) {
        console.error("Error adding song to My Songs:", error);
      }
    }
  };

  // Handle clicking on an artist card to search for their songs
  const handleArtistClick = async (artistUrl: string) => {
    console.log('[ArtistCard] Clicked artistUrl:', artistUrl);
    try {
      // Extract artist segment from URL
      const url = new URL(artistUrl);
      const path = url.pathname.replace(/^\/+|\/+$/g, '');
      const segments = path.split('/');
      const artistSlug = segments[0];
      if (!artistSlug) {
        console.warn('[ArtistCard] Could not extract artist from URL:', artistUrl);
        return;
      }
      // Fetch artist's songs from backend
      console.log('[SearchResults] Fetching songs for artist:', artistSlug);
      const response = await fetch(`http://localhost:3001/api/cifraclub-artist-songs?artistUrl=${encodeURIComponent(artistUrl)}`);
      if (!response.ok) {
        console.error('[SearchResults] Failed to fetch artist songs:', response.statusText);
        return;
      }
      const songs = await response.json();
      console.log(`[SearchResults] Songs for artist ${artistSlug}:`, songs);
      // Convert to SongData[]
      const formattedSongs: SongData[] = songs.map((song: { title: string; url: string }) => ({
        id: song.url, // Use URL as id for now
        title: song.title,
        artist: artistSlug,
        path: song.url,
      }));
      setArtistSongs(formattedSongs);
    } catch (e) {
      console.error('[ArtistCard] Invalid artistUrl or fetch error:', artistUrl, e);
    }
  };

  return (
    <div className="space-y-4">
      {artistSongs ? (
        <>
          <h2 className="text-lg font-medium mb-4">
            {artistSongs.length} songs found for artist
            <span className="block text-sm text-muted-foreground mt-1">
              Songs from Cifra Club. Click "+" to add to your songs.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onView={handleViewSong}
                onDelete={() => handleAddToMySongs(song)}
                deleteButtonIcon="plus"
                deleteButtonLabel={`Add ${song.title} to My Songs`}
                viewButtonIcon="external"
                viewButtonLabel="Open in Cifra Club"
              />
            ))}
          </div>
          <button
            className="mt-4 underline text-sm text-chord"
            onClick={() => setArtistSongs(null)}
          >
            ← Back to search results
          </button>
        </>
      ) : loading ? (
        <div className="text-center p-6">
          <div className="loading-spinner"></div>
          <p className="mt-2 text-muted-foreground">Searching chord sheets...</p>
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-destructive">{error}</Card>
      ) : (!loading && results.length === 0) ? (
        <Card className="p-6 text-center">
          <p className="text-lg font-medium mb-2">No results found for {getQueryDisplayText(searchParams)}</p>
          <p className="text-muted-foreground">Try a different search term or check your spelling.</p>
        </Card>
      ) : (
        <>
          <h2 className="text-lg font-medium mb-4">
            {results.length} results found for {getQueryDisplayText(searchParams)}
            <span className="block text-sm text-muted-foreground mt-1">
              Results from Cifra Club. Click "+" to add to your songs.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => {
              // Check if we're searching for an artist
              const searchType = getSearchParamsType(searchParams);
              
              if (searchType === 'artist') {
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
              } else {
                // Default song search behavior
                const songData = formatSearchResult(item);
                return (
                  <SongCard
                    key={songData.id}
                    song={songData}
                    onView={handleViewSong}
                    onDelete={() => handleAddToMySongs(songData)}
                    deleteButtonIcon="plus"
                    deleteButtonLabel={`Add ${songData.title} to My Songs`}
                    viewButtonIcon="external"
                    viewButtonLabel="Open in Cifra Club"
                  />
                );
              }
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
