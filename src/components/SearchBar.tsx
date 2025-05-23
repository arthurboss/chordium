import { User, Music, ArrowLeft, Search } from "lucide-react";
import FormField from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SearchBarProps {
  className?: string;
  artistLoading?: boolean;
  loading?: boolean;
  // Current value for the artist input field, controlled by parent component
  artistValue: string;
  // Current value for the song input field, controlled by parent component
  songValue: string;
  // Called whenever either input field changes
  onInputChange: (artist: string, song: string) => void;
  // Called when the search form is submitted
  onSearchSubmit: (artist: string, song: string) => void;
  // Whether to show the back button
  showBackButton?: boolean;
  // Called when the back button is clicked
  onBackClick?: () => void;
  // Whether the search button should be disabled
  isSearchDisabled?: boolean;
}

const SearchBar = ({ 
  className = "", 
  artistLoading = false, 
  loading = false,
  artistValue,
  songValue,
  onInputChange, 
  onSearchSubmit,
  showBackButton = false,
  onBackClick,
  isSearchDisabled = false
}: SearchBarProps) => {
  // Handle input changes and propagate to parent component
  // No local state is maintained - this component uses the parent's state
  const handleArtistChange = (value: string) => {
    onInputChange(value, songValue);
  };
  
  const handleSongChange = (value: string) => {
    onInputChange(artistValue, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(artistValue, songValue);
  };

  return (
    <form className={`w-full ${className}`} onSubmit={handleSubmit} id="search-form">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <FormField
              id="artist-search-input"
              value={artistValue}
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
              value={songValue}
              onChange={handleSongChange}
              disabled={loading || artistLoading}
              placeholder="Search for a song"
              leftIcon={<Music className="h-4 w-4" />}
            />
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-between items-center">
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackClick}
            className="w-24"
            disabled={!!(loading || artistLoading || !showBackButton || !onBackClick)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button 
            type="submit"
            className="ml-auto w-24"
            size="sm"
            disabled={!!(loading || artistLoading || isSearchDisabled)}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
