import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import axios from "axios";

interface SearchResult {
  title: string;
  url: string;
}

interface SearchBarProps {
  searchType?: 'dual' | 'combined';
  className?: string;
}

const SearchBar = ({ searchType = 'combined', className = "" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const [songName, setSongName] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchType === 'combined' && query.trim()) {
      console.log('SearchBar submitting combined query:', query.trim());
      const backendUrl = `http://localhost:3001/api/cifraclub-search?q=${encodeURIComponent(query.trim())}`;
      performSearch(backendUrl, `q=${encodeURIComponent(query.trim())}`);
    } 
    else if (searchType === 'dual') {
      if (artist.trim() && !songName.trim()) {
        // Only artist is filled
        console.log('SearchBar submitting artist query:', artist.trim());
        const backendUrl = `http://localhost:3001/api/cifraclub-search?searchType=artist&q=${encodeURIComponent(artist.trim())}`;
        performSearch(backendUrl, `searchType=artist&q=${encodeURIComponent(artist.trim())}`);
      } 
      else if (!artist.trim() && songName.trim()) {
        // Only song name is filled
        console.log('SearchBar submitting song query:', songName.trim());
        const backendUrl = `http://localhost:3001/api/cifraclub-search?searchType=song&q=${encodeURIComponent(songName.trim())}`;
        performSearch(backendUrl, `searchType=song&q=${encodeURIComponent(songName.trim())}`);
      }
      else if (artist.trim() && songName.trim()) {
        // Both fields are filled - create a path with both segments: /artist/songname
        const formattedArtist = artist.trim().toLowerCase().replace(/\s+/g, '-');
        const formattedSongName = songName.trim().toLowerCase().replace(/\s+/g, '-');
        
        // Combined path query for specific artist and song
        const combinedPath = `${formattedArtist}/${formattedSongName}`;
        console.log('SearchBar submitting combined path query:', combinedPath);
        
        // Use the combined path as the query with song search type to ensure proper filtering
        const backendUrl = `http://localhost:3001/api/cifraclub-search?searchType=song&q=${encodeURIComponent(combinedPath)}`;
        performSearch(backendUrl, `searchType=song&q=${encodeURIComponent(combinedPath)}`);
      }
      else {
        console.log('SearchBar: empty queries, not submitting');
      }
    } 
    else {
      console.log('SearchBar: empty query, not submitting');
    }
  };

  const performSearch = async (backendUrl: string, queryParams: string) => {
    console.log('Calling backend at:', backendUrl);
    
    try {
      const res = await axios.get<SearchResult[]>(backendUrl);
      console.log(`CifraClub search results: Found ${res.data.length} items`);
      console.log('Response data:', res.data);
      
      if (res.data.length === 0) {
        console.log('No results found. Check backend console for more details.');
      }
      
      // Navigate to results page with appropriate query params
      navigate(`/search?${queryParams}`);
    } catch (err) {
      console.error('SearchBar: backend search failed', err);
      console.error('Error details:', err.response?.data || err.message);
      // Optionally show an error toast or message
    }
  };

  if (searchType === 'dual') {
    return (
      <form onSubmit={handleSearch} className={`w-full ${className}`}>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1">
            <FormField
              id="artist-search-input" 
              value={artist}
              onChange={setArtist}
              placeholder="Search for an artist"
              leftIcon={<User className="h-4 w-4" />}
            />
          </div>
          
          {/* Middle column for connection words - minimal width */}
          <div className="hidden sm:flex flex-col text-sm items-center justify-center text-muted-foreground px-2">
            and | or
          </div>
          
          <div className="flex-1">
            <FormField
              id="song-search-input"
              value={songName}
              onChange={setSongName}
              placeholder="Search for a song"
              leftIcon={<Music className="h-4 w-4" />}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-6"
            disabled={!artist.trim() && !songName.trim()}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form 
      onSubmit={handleSearch} 
      className={`flex flex-col sm:flex-row gap-2 w-full ${className}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          type="text" 
          placeholder="Search for a song or artist..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 w-full bg-card dark:bg-[var(--card)]"
        />
      </div>
      <Button type="submit" className="sm:w-auto" disabled={!query.trim()}>Search</Button>
    </form>
  );
};

export default SearchBar;
