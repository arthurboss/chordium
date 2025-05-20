import { useState } from "react";
import { User, Music } from "lucide-react";
import FormField from "@/components/ui/form-field";

interface SearchBarProps {
  className?: string;
  artistLoading?: boolean;
  loading?: boolean;
  onSearchChange: (artist: string, song: string) => void;
}

const SearchBar = ({ className = "", artistLoading = false, loading = false, onSearchChange }: SearchBarProps) => {
  const [artist, setArtist] = useState("");
  const [songName, setSongName] = useState("");

  // Call onSearchChange on every input change
  const handleArtistChange = (value: string) => {
    setArtist(value);
    onSearchChange(value, songName);
  };
  const handleSongChange = (value: string) => {
    setSongName(value);
    onSearchChange(artist, value);
  };

  return (
    <form className={`w-full ${className}`} onSubmit={e => e.preventDefault()}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <FormField
            id="artist-search-input" 
            value={artist}
            onChange={handleArtistChange}
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
            onChange={handleSongChange}
            disabled={loading || artistLoading}
            placeholder="Search for a song"
            leftIcon={<Music className="h-4 w-4" />}
          />
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
