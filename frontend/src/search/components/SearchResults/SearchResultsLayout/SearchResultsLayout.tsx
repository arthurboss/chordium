import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ResultsList from "@/components/ui/ResultsList";
import FormContainer from "@/components/ui/FormContainer";
import LoadingState from "@/components/LoadingState";
import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";
import type { SearchResult, SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { isSlugDerivedName } from "@/utils/url-slug-utils";
import { ResultCard } from "../../ResultCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "default" | "az" | "za";


function sortResults(items: SearchResult[], sort: SortOption): SearchResult[] {
  if (sort === "default") return items;
  const arr = [...items];
  const label = (r: SearchResult) => r.type === "song" ? r.title : r.displayName;
  return arr.sort((a, b) =>
    sort === "az"
      ? label(a).localeCompare(label(b))
      : label(b).localeCompare(label(a))
  );
}

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results = [],
  onResultClick,
  activeArtist,
  loading = false,
  loadingMessage,
}) => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortOption>("default");

  // The container is the same card as the search bar, so the trigger's own
  // background is swapped to bg-background - otherwise it'd blend into that card
  // the same way a result row would if left at its own default card color.
  // Disabled while loading: sorting a list that's about to be replaced makes
  // no sense, and it visibly says so rather than just quietly doing nothing.
  const sortControl = (
    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)} disabled={loading}>
      <SelectTrigger className="h-7 w-auto gap-1 bg-background px-2 text-xs [&>span]:text-left">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">{t("sort.default")}</SelectItem>
        <SelectItem value="az">{t("sort.az")}</SelectItem>
        <SelectItem value="za">{t("sort.za")}</SelectItem>
      </SelectContent>
    </Select>
  );

  // On a narrow screen the title hugs the left edge, level with the sort
  // control, since there's no room to spare for centering it. From sm up, the
  // leading spacer joins the layout as a real grid column - matching the
  // trailing one - so the title lands in the card's true center rather than
  // just the space left of the control.
  const resultsHeader = (
    <div className="flex items-center justify-between gap-2 pb-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
      <div className="hidden sm:block" />
      <h2 className="text-left text-xl font-semibold sm:text-center">{t("searchResults.results")}</h2>
      <div className="flex justify-end">{sortControl}</div>
    </div>
  );

  // Rendered in the sections' own place, inside the same card and behind the
  // same header, so a search in flight doesn't swap the whole layout out for
  // a differently-sized one and back again a moment later.
  if (loading) {
    return (
      <FormContainer contentClassName="pb-2">
        {resultsHeader}
        <LoadingState message={loadingMessage} />
      </FormContainer>
    );
  }

  if (results.length === 0) {
    return (
      <FormContainer>
        <div className="p-8 text-center text-muted-foreground" data-cy="search-no-chord-sheets-found">
          {t("searchResults.noResults")}
        </div>
      </FormContainer>
    );
  }

  const renderItems = (items: SearchResult[]) => (
    <ResultsList
      items={sortResults(items, sort)}
      renderItem={({ item }) => (
        <ResultCard key={item.path} result={item} onClick={onResultClick} />
      )}
    />
  );

  // One artist's own songs are a single list under that artist's name.
  if (activeArtist) {
    // Prefer activeArtist.displayName unless it's an untouched slug guess
    // (e.g. "Ac Dc" for path "ac-dc") - in that case the scraped song's real
    // artist name (e.g. "AC/DC") is more trustworthy. A confirmed
    // displayName (from the search API, cache, or sessionStorage) always
    // wins, since it can't be recovered from a per-song scrape.
    const firstSong = results.find((result) => result.type === "song");
    const title =
      activeArtist.displayName && !isSlugDerivedName(activeArtist.displayName, activeArtist.path)
        ? activeArtist.displayName
        : (firstSong?.type === "song" ? firstSong.artist : "") || activeArtist.displayName;

    return (
      <FormContainer contentClassName="pb-2">
        {resultsHeader}
        <SearchResultsSection title={title} count={results.length} defaultOpen hideDivider>
          {renderItems(results)}
        </SearchResultsSection>
      </FormContainer>
    );
  }

  // Artists above songs. A query matches far fewer acts than songs, so the short
  // list reads as a way to narrow down rather than as something in the way, and
  // the act someone named stays visible without scrolling past their catalogue.
  //
  // Songs the search names come before songs that merely contain it, kept apart
  // so that a word buried in a thousand sets of lyrics cannot crowd out the song
  // actually being looked for. A kind with nothing in it gets no section at all.
  const sections: { key: string; title: string; items: SearchResult[] }[] = [
    {
      key: "artists",
      title: t("searchResults.artists"),
      items: results.filter((result) => result.type === "artist"),
    },
    {
      key: "songs",
      title: t("searchResults.songs"),
      items: results.filter((result) => result.type === "song" && result.match !== "lyrics"),
    },
  ];

  const lyrics = results.filter((result) => result.type === "song" && result.match === "lyrics");
  if (lyrics.length > 0) {
    sections.push({
      key: "lyrics",
      title: t("searchResults.lyricsMatches"),
      items: lyrics,
    });
  }

  const shown = sections.filter((section) => section.items.length > 0);

  return (
    <FormContainer contentClassName="pb-2">
      {resultsHeader}
      <div className="flex flex-col w-full gap-2">
        {shown.map((section, index) => (
          <SearchResultsSection
            key={section.key}
            title={section.title}
            count={section.items.length}
            hideDivider={index === shown.length - 1}
          >
            {renderItems(section.items)}
          </SearchResultsSection>
        ))}
      </div>
    </FormContainer>
  );
};

export default SearchResultsLayout;
