import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormField from "@/components/ui/form-field";
import type { SearchBarProps } from "./SearchBar.types";
import VoiceSearchButton from "../VoiceSearchButton/VoiceSearchButton";
import { cyAttr } from "@/utils/test-utils";

const SearchBar = ({
  className = "",
  loading = false,
  value = "",
  onInputChange,
  onSearchSubmit,
  isSearchDisabled = false,
  voiceState,
  onVoiceStart,
  onVoiceStop,
}: SearchBarProps) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(value);
  };

  const hasVoice = voiceState && voiceState !== "unsupported" && onVoiceStart && onVoiceStop;

  return (
    <form className={`w-full ${className}`} onSubmit={handleSubmit} id="search-form">
      {/* Back and clear moved to the results card - they act on results, not the
          field. Voice is about the field itself, so it sits within it, ahead of
          submit: both are things to do with what has been typed, and keeping them
          together is what lets the field be a single row. */}
      <FormField
        id="search-input"
        value={value}
        onChange={onInputChange}
        disabled={loading}
        placeholder={t("searchBar.placeholder")}
        trailingButton={
          <>
            {hasVoice && (
              <VoiceSearchButton
                state={voiceState}
                onStart={onVoiceStart}
                onStop={onVoiceStop}
                disabled={loading}
              />
            )}
            <button
              type="submit"
              aria-label={t("searchBar.search")}
              disabled={loading || isSearchDisabled}
              className="form-field-shell__trailing flex w-10 shrink-0 items-center justify-center border-l bg-background text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              {...cyAttr("search-submit-button")}
            >
              <Search className="h-4 w-4" />
            </button>
          </>
        }
      />
    </form>
  );
};

export default SearchBar;
