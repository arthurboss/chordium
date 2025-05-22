import { useState } from "react";
import { User, Music } from "lucide-react";
import FormField from "@/components/ui/form-field";

interface SearchBarProps {
  className?: string;
  artistLoading?: boolean;
  loading?: boolean;
  onInputChange: (artist: string, song: string) => void;
  onSearchSubmit: (artist: string, song: string) => void;
}

const SearchBar = ({ className = "", artistLoading = false, loading = false, onInputChange, onSearchSubmit }: SearchBarProps) => {
  const [artist, setArtist] = useState("");
  const [songName, setSongName] = useState("");

  // Call onInputChange on every input change
  const handleArtistChange = (value: string) => {
    setArtist(value);
    onInputChange(value, songName);
  };
  const handleSongChange = (value: string) => {
    setSongName(value);
    onInputChange(artist, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(artist, songName);
  };

  return (
    <form className={`w-full ${className}`} onSubmit={handleSubmit}>
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
        <button
          type="submit"
          className="ml-0 sm:ml-2 px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
          disabled={loading || artistLoading}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
