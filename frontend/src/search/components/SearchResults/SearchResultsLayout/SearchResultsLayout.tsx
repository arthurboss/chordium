import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ResultsList from "@/components/ui/ResultsList";
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

/**
 * How many songs matched through their words are listed. These are the weakest
 * results and the longest tail - a common word turns up in hundreds of songs - so
 * the section shows a browsable few and says how many were found.
 */
const LYRICS_SHOWN = 25;

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
}) => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortOption>("default");

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground" data-cy="search-no-chord-sheets-found">
        {t("searchResults.noResults")}
      </div>
    );
  }

  const sortControl = (
    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
      <SelectTrigger className="w-36 bg-card [&>span]:text-left">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">{t("sort.default")}</SelectItem>
        <SelectItem value="az">{t("sort.az")}</SelectItem>
        <SelectItem value="za">{t("sort.za")}</SelectItem>
      </SelectContent>
    </Select>
  );

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
      <div className="flex flex-col w-full">
        <SearchResultsSection
          title={title}
          count={results.length}
          action={sortControl}
          defaultOpen
        >
          {renderItems(results)}
        </SearchResultsSection>
      </div>
    );
  }

  // Artists above songs. A query matches far fewer acts than songs, so the short
  // list reads as a way to narrow down rather than as something in the way, and
  // the act someone named stays visible without scrolling past their catalogue.
  //
  // Songs the search names come before songs that merely contain it, kept apart
  // so that a word buried in a thousand sets of lyrics cannot crowd out the song
  // actually being looked for. A kind with nothing in it gets no section at all.
  const sections: { key: string; title: string; items: SearchResult[]; total?: number }[] = [
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
      items: lyrics.slice(0, LYRICS_SHOWN),
      total: lyrics.length,
    });
  }

  const shown = sections.filter((section) => section.items.length > 0);

  return (
    <div className="flex flex-col gap-2 w-full">
      {shown.map((section, index) => (
        <SearchResultsSection
          key={section.key}
          title={section.title}
          count={section.items.length}
          total={section.total}
          // One sort control for the page, level with the heading it sits beside.
          action={index === 0 ? sortControl : undefined}
        >
          {renderItems(section.items)}
        </SearchResultsSection>
      ))}
    </div>
  );
};

export default SearchResultsLayout;
