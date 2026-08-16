import { ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormField from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SearchBarProps } from "./SearchBar.types";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import VoiceSearchButton from "../VoiceSearchButton/VoiceSearchButton";
import { cyAttr } from "@/utils/test-utils";

const SearchBar = ({
  className = "",
  loading = false,
  value = "",
  onInputChange,
  onSearchSubmit,
  showBackButton = false,
  onBackClick,
  isSearchDisabled = false,
  onClearSearch,
  clearDisabled = false,
  voiceState,
  onVoiceStart,
  onVoiceStop,
}: SearchBarProps) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(value);
  };

  return (
    <form className={`w-full ${className}`} onSubmit={handleSubmit} id="search-form">
      <div className="flex flex-col gap-2">
        <FormField
          id="search-input"
          value={value}
          onChange={onInputChange}
          disabled={loading}
          placeholder={t("searchBar.placeholder")}
          trailingButton={
            <button
              type="submit"
              aria-label={t("searchBar.search")}
              disabled={loading || isSearchDisabled}
              className="form-field-shell__trailing flex w-10 items-center justify-center border-l bg-background text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              {...cyAttr("search-submit-button")}
            >
              <Search className="h-4 w-4" />
            </button>
          }
        />

        <Separator className="my-2" />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onBackClick}
            className="h-10 w-10 rounded-full"
            disabled={!!(loading || !showBackButton || !onBackClick)}
            aria-label={t("searchBar.back")}
            {...cyAttr("back-button")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-grow" />

          {voiceState && voiceState !== "unsupported" && onVoiceStart && onVoiceStop && (
            <VoiceSearchButton
              state={voiceState}
              onStart={onVoiceStart}
              onStop={onVoiceStop}
              disabled={loading}
            />
          )}

          <RoundTrashButton
            onClick={onClearSearch}
            aria-label={t("searchBar.clearAriaLabel")}
            tabIndex={0}
            disabled={clearDisabled}
            {...cyAttr("clear-search-button")}
          />
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
