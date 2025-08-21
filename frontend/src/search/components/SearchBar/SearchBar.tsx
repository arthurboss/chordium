import { User, Music, ArrowLeft, Search } from "lucide-react";
import FormField from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SearchBarProps } from "./SearchBar.types";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import { cyAttr } from "@/utils/test-utils";

const SearchBar = ({
  className = "",
  artistLoading = false,
  loading = false,
  artistValue = "",
  songValue = "",
  onInputChange,
  onSearchSubmit,
  showBackButton = false,
  onBackClick,
  isSearchDisabled = false,
  onClearSearch,
  clearDisabled = false,
  artistDisabled = false
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
              disabled={loading || artistLoading || artistDisabled}
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackClick}
            className="w-24"
            disabled={!!(loading || artistLoading || !showBackButton || !onBackClick)}
            {...cyAttr('back-button')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-grow" />

          <RoundTrashButton
            onClick={onClearSearch}
            aria-label="Clear search"
            tabIndex={0}
            disabled={clearDisabled}
            {...cyAttr('clear-search-button')}
          />
          <Button
            type="submit"
            className="w-24"
            size="sm"
            disabled={!!(loading || artistLoading || isSearchDisabled)}
            {...cyAttr('search-submit-button')}
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
