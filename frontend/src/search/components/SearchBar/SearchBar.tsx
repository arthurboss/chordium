import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormField from "@/components/ui/form-field";
import { Separator } from "@/components/ui/separator";
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

        {/* Back and clear moved to the results card - they act on results, not
            the field, and that's where a reader looks for them now. Only voice
            is still about the field itself, so it's the only thing left here. */}
        {hasVoice && (
          <>
            <Separator className="my-2" />
            <div className="flex items-center justify-end">
              <VoiceSearchButton
                state={voiceState}
                onStart={onVoiceStart}
                onStop={onVoiceStop}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
