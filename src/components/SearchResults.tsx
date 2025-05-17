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
import { useState, useEffect } from "react";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchResults = ({ setMySongs, setActiveTab }: SearchResultsProps) => {
  const { results, loading, error, searchParams } = useSearchResults();
  const navigate = useNavigate();
  const [artistSongs, setArtistSongs] = useState<SongData[] | null>(null);
  const [artistLoading, setArtistLoading] = useState(false);

  // Reset artist songs when parameters change
  useEffect(() => {
    setArtistSongs(null);
  }, [searchParams]);

  const isLoading = loading || artistLoading;

  const handleViewSong = (song: SongData) => {
    window.open(song.path, "_blank", "noopener,noreferrer");
  };

  const handleAddToMySongs = async (song: SongData) => {
    if (setMySongs && setActiveTab) {
      try {
        const content = `# ${song.title || 'Untitled Song'}\n## ${song.artist || 'Unknown Artist'}\n\n...`;
        handleSaveNewSong(content, song.title, setMySongs, navigate, setActiveTab);
      } catch (err) {
        console.error("Error adding song to My Songs:", err);
      }
    }
  };

  const handleArtistClick = async (artistUrl: string) => {
    if (artistLoading) return;
    setArtistLoading(true);
    try {
      const url = new URL(artistUrl);
      const slug = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
      if (!slug) return;
      const resp = await fetch(`http://localhost:3001/api/cifraclub-artist-songs?artistUrl=${encodeURIComponent(artistUrl)}`);
      if (!resp.ok) throw new Error(resp.statusText);
      const data: { title: string; url: string }[] = await resp.json();
      const formatted: SongData[] = data.map(item => ({ id: item.url, title: item.title, artist: slug, path: item.url }));
      setArtistSongs(formatted);
    } catch (e) {
      console.error('[SearchResults] Artist fetch error:', e);
    } finally {
      setArtistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-6">
        <div className="loading-spinner"></div>
        <p className="mt-2 text-muted-foreground">
          {artistLoading ? 'Loading artist songs...' : 'Searching chord sheets...'}
        </p>
      </div>
    );
  }

  if (artistSongs) {
    return (
      <>
        <h2 className="text-lg font-medium mb-4">
          {artistSongs.length} songs for artist
          <span className="block text-sm text-muted-foreground mt-1">
            Songs from Cifra Club. Click "+" to add to your songs.
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artistSongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              onView={handleViewSong}
              onDelete={() => handleAddToMySongs(song)}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${song.title}`}
              viewButtonIcon="external"
              viewButtonLabel="Open"
            />
          ))}
        </div>
        <button className="mt-4 underline text-sm text-chord" onClick={() => setArtistSongs(null)}>
          ← Back to search results
        </button>
      </>
    );
  }

  if (error) {
    return <Card className="p-6 text-center text-destructive">{error}</Card>;
  }

  if (!loading && results.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-medium mb-2">No results for {getQueryDisplayText(searchParams)}</p>
        <p className="text-muted-foreground">Try a different search term.</p>
      </Card>
    );
  }

  return (
    <>
      <h2 className="text-lg font-medium mb-4">
        {results.length} results for {getQueryDisplayText(searchParams)}
        <span className="block text-sm text-muted-foreground mt-1">
          Results from Cifra Club. Click "+" to add to your songs.
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(item => {
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
              onDelete={() => handleAddToMySongs(songData)}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="external"
              viewButtonLabel="Open in Cifra Club"
            />
          );
        })}
      </div>
    </>
  );
};

export default SearchResults;
