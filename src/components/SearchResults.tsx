import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Card } from "@/components/ui/card";
import SongCard from "./SongCard";
import { SongData } from "@/types/song";
import { handleSaveNewSong } from "@/utils/song-actions";
import "@/components/ui/loading-spinner.css";

interface SearchResultItem {
  title: string;
  url: string;
}

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchResults = ({ setMySongs, setActiveTab }: SearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      // Get search params
      const query = searchParams.get("q");
      const searchType = searchParams.get("searchType");
      
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      try {
        // Build the appropriate URL based on the search parameters
        let backendUrl = `http://localhost:3001/api/cifraclub-search?q=${encodeURIComponent(query)}`;
        if (searchType) {
          backendUrl += `&searchType=${searchType}`;
        }
        
        const res = await axios.get<SearchResultItem[]>(backendUrl);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchParams]);

  // Convert search result to SongData format for SongCard component
  const formatSearchResult = (item: SearchResultItem): SongData => {
    // Extract artist and song title from the search result
    let artist = "";
    let title = item.title;

    // If the title contains a hyphen, assume format is "Song Title - Artist Name"
    if (item.title.includes(" - ")) {
      const parts = item.title.split(" - ");
      title = parts[0].trim();
      artist = parts[1].trim();
    } else {
      // Try to extract from URL path segments if no hyphen in title
      try {
        const url = new URL(item.url);
        const path = url.pathname.replace(/^\/|\/$/g, '');
        const segments = path.split('/');
        
        // If we have 2 segments, first is artist, second is song
        if (segments.length === 2) {
          // Convert dash-case to Title Case for both segments
          const formattedArtist = segments[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          const formattedTitle = segments[1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          // Only override if we don't already have parsed values
          if (!artist) artist = formattedArtist;
          if (title === item.title) title = formattedTitle;
        }
      } catch (e) {
        console.error("Error parsing URL:", e);
      }
    }

    return {
      id: uuidv4(),
      title: title,
      artist: artist, 
      path: item.url,
    };
  };

  // Handle viewing a song, which will navigate to view chords externally
  const handleViewSong = (song: SongData) => {
    window.open(song.path, "_blank", "noopener,noreferrer");
  };

  // Handle adding a song to the user's saved songs
  const handleAddToMySongs = async (song: SongData) => {
    if (setMySongs && setActiveTab) {
      try {
        // Show saving action
        const savingIndex = results.findIndex(
          r => formatSearchResult(r).id === song.id
        );
        
        if (savingIndex !== -1) {
          // We would ideally fetch chord content from the URL here
          // For now creating a placeholder with proper formatting
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
        // You could show an error toast here
      }
    }
  };

  // Get search query information for display
  const query = searchParams.get("q") || "";
  const searchType = searchParams.get("searchType");

  // Format query for display
  const getQueryDisplayText = () => {
    if (!query) return "";
    
    if (searchType === "artist") {
      return `"${query}" in Artists`;
    } else if (searchType === "song") {
      return `"${query}" in Songs`;
    } else {
      return `"${query}"`;
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center p-6">
          <div className="loading-spinner"></div>
          <p className="mt-2 text-muted-foreground">Searching chord sheets...</p>
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-destructive">{error}</Card>
      ) : results.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-lg font-medium mb-2">No results found for {getQueryDisplayText()}</p>
          <p className="text-muted-foreground">Try a different search term or check your spelling.</p>
        </Card>
      ) : (
        <>
          <h2 className="text-lg font-medium mb-4">
            {results.length} results found for {getQueryDisplayText()}
            <span className="block text-sm text-muted-foreground mt-1">
              Results from Cifra Club. Click "+" to add to your songs.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => {
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
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
