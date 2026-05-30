import { User, Music, ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  artistDisabled = false,
}: SearchBarProps) => {
  const { t } = useTranslation();

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
              placeholder={t("searchBar.artistPlaceholder")}
              leftIcon={<User className="h-4 w-4" />}
            />
          </div>
          <div className="hidden sm:flex flex-col text-sm items-center justify-center text-muted-foreground px-2">
            {t("searchBar.andOr")}
          </div>
          <div className="flex-1">
            <FormField
              id="song-search-input"
              value={songValue}
              onChange={handleSongChange}
              disabled={loading || artistLoading}
              placeholder={t("searchBar.songPlaceholder")}
              leftIcon={<Music className="h-4 w-4" />}
            />
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onBackClick}
            className="h-10 w-10 rounded-full"
            disabled={!!(loading || artistLoading || !showBackButton || !onBackClick)}
            aria-label={t("searchBar.back")}
            {...cyAttr("back-button")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-grow" />

          <RoundTrashButton
            onClick={onClearSearch}
            aria-label={t("searchBar.clearAriaLabel")}
            tabIndex={0}
            disabled={clearDisabled}
            {...cyAttr("clear-search-button")}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!!(loading || artistLoading || isSearchDisabled)}
            aria-label={t("searchBar.search")}
            {...cyAttr("search-submit-button")}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
