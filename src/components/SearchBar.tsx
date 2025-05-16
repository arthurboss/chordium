import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import { formatSearchUrl } from "@/utils/search-utils";
import { useSearchLoading } from "@/hooks/useSearchLoading";

interface SearchBarProps {
  searchType?: 'dual' | 'combined';
  className?: string;
}

const SearchBar = ({ searchType = 'combined', className = "" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const [songName, setSongName] = useState("");
  const navigate = useNavigate();
  const { isSearching, setSearchLoading } = useSearchLoading();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't proceed if search is already in progress
    if (isSearching) return;

    let navArtist = "";
    let navSong = "";

    switch (searchType) {
      case "combined": {
        if (!query.trim()) return;
        const formattedQuery = query.trim().toLowerCase().replace(/\s+/g, "-");
        navArtist = formattedQuery;
        navSong = formattedQuery;
        break;
      }
      case "dual": {
        const hasArtist = artist.trim();
        const hasSong = songName.trim();
        if (!hasArtist && !hasSong) return;
        const formattedArtist = hasArtist ? artist.trim().toLowerCase().replace(/\s+/g, "-") : "";
        const formattedSong = hasSong ? songName.trim().toLowerCase().replace(/\s+/g, "-") : "";
        if (hasArtist && !hasSong) {
          navArtist = formattedArtist;
        } else if (!hasArtist && hasSong) {
          navSong = formattedSong;
        } else if (hasArtist && hasSong) {
          navArtist = formattedArtist;
          navSong = formattedSong;
        }
        break;
      }
      default:
        return;
    }

    // Set search loading state
    setSearchLoading(true);
    
    // Only update the URL; fetching is handled by useSearchResults
    navigate(formatSearchUrl(navArtist, navSong || (searchType === 'combined' ? navArtist : "")));
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
              disabled={isSearching}
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
              disabled={isSearching}
              placeholder="Search for a song"
              leftIcon={<Music className="h-4 w-4" />}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-6"
            disabled={isSearching || (!artist.trim() && !songName.trim())}
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
          disabled={isSearching}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 w-full bg-card dark:bg-[var(--card)]"
        />
      </div>
      <Button type="submit" className="sm:w-auto" disabled={isSearching || !query.trim()}>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
