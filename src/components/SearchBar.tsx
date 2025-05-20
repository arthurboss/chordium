import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import { formatSearchUrl } from "@/utils/search-utils";

interface SearchBarProps {
  className?: string;
  artistLoading?: boolean;
  loading?: boolean;
}

const SearchBar = ({ className = "", artistLoading = false, loading = false }: SearchBarProps) => {
  const [artist, setArtist] = useState("");
  const [songName, setSongName] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted');
    let navArtist = "";
    let navSong = "";
    // Only dual mode supported
    const hasArtist = artist.trim();
    const hasSong = songName.trim();
    if (!hasArtist && !hasSong) return;
    const formattedArtist = hasArtist ? artist.trim() : "";
    const formattedSong = hasSong ? songName.trim() : "";
    if (hasArtist && !hasSong) {
      navArtist = formattedArtist;
    } else if (!hasArtist && hasSong) {
      navSong = formattedSong;
    } else if (hasArtist && hasSong) {
      navArtist = formattedArtist;
      navSong = formattedSong;
    }
    // Format the search URL
    const searchUrl = formatSearchUrl(navArtist, navSong);
    console.log('Navigating to search URL:', searchUrl);
    // Check if we're already on the same search terms
    const currentPath = window.location.pathname;
    const currentParams = new URLSearchParams(window.location.search);
    const currentArtist = currentParams.get('artist') || '';
    const currentSong = currentParams.get('song') || '';
    const isSameSearch = (
      currentPath === '/search' && 
      currentArtist.toLowerCase() === navArtist.toLowerCase() && 
      currentSong.toLowerCase() === navSong.toLowerCase()
    );
    if (isSameSearch) {
      console.log('Same search detected, attempting to trigger refresh via hook');
      navigate(searchUrl, { replace: true });
    } else {
      navigate(searchUrl);
    }
    setArtist(artist.trim());
    setSongName(songName.trim());
  };

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <FormField
            id="artist-search-input" 
            value={artist}
            onChange={setArtist}
            disabled={loading || artistLoading}
            placeholder="Search for an artist"
            leftIcon={<User className="h-4 w-4" />}
          />
        </div>
        <div className="hidden sm:flex flex-col text-sm items-center justify-center text-muted-foreground px-2">
          and | or
        </div>
        <div className="flex-1">
          <FormField
            id="song-search-input"
            value={songName}
            onChange={setSongName}
            disabled={loading || artistLoading}
            placeholder="Search for a song"
            leftIcon={<Music className="h-4 w-4" />}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="px-6"
          disabled={loading || artistLoading || (!artist.trim() && !songName.trim())}
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
