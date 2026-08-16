import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import ResultsList from "@/components/ui/ResultsList";
import FormContainer from "@/components/ui/FormContainer";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";
import type { SearchResult, SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { isSlugDerivedName } from "@/utils/url-slug-utils";
import { filterSearchHitsByText } from "@/search/utils/filtering/filterSearchHitsByText";
import { ResultCard } from "../../ResultCard";
import { cyAttr } from "@/utils/test-utils";
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
  error,
  emptyMessage,
  onBackClick,
  onClearSearch,
  clearDisabled = false,
}) => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortOption>("default");
  // Which section, if any, a reader has selected out of the overview. Set,
  // the overview gives way to just that section - title, its own filter and
  // sort, and its results - rather than the other sections merely collapsing
  // alongside it.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Scoped to whichever section is selected - starting over, filter-wise,
  // each time a different one is opened rather than carrying text across.
  const [sectionFilter, setSectionFilter] = useState("");
  // The single-artist view only ever has one section, but still gets its own
  // open state rather than being permanently open, so it can still be closed.
  const [artistSectionOpen, setArtistSectionOpen] = useState(true);

  const hasResults = results.length > 0;

  function selectSection(key: string) {
    setSelectedKey(key);
    setSectionFilter("");
  }

  function backToOverview() {
    setSelectedKey(null);
    setSectionFilter("");
  }

  // Back and clear now live here rather than on the search bar: both act on
  // results (leave this artist, leave a selected section, clear this search),
  // not on the field itself. Which "leave" it performs, and whether there's
  // anywhere to leave to, depends on which view is actually showing, so the
  // caller supplies both.
  const renderBackButton = (onClick: (() => void) | undefined, disabled: boolean) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      className="h-10 w-10 rounded-full"
      disabled={disabled || !onClick}
      aria-label={t("searchBar.back")}
      {...cyAttr("back-button")}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  const trashButton = (
    <RoundTrashButton
      onClick={onClearSearch}
      aria-label={t("searchBar.clearAriaLabel")}
      tabIndex={0}
      disabled={clearDisabled}
      {...cyAttr("clear-search-button")}
    />
  );

  // Back and clear are equal-width (both h-10 w-10 rounded-full), so flanking
  // the title with them centers it for free - no separate spacer column
  // needed. On a narrow screen there's no room for three across, so the title
  // takes the left edge and both buttons reorder to the right, together,
  // within an easy thumb's reach - order flips at sm, position never moves.
  const renderHeader = (backOnClick: (() => void) | undefined, backDisabled: boolean) => (
    <div className="flex items-center gap-2 pb-3">
      <div className="order-2 sm:order-1">{renderBackButton(backOnClick, backDisabled)}</div>
      <h2 className="order-1 sm:order-2 flex-1 text-left text-xl font-semibold sm:text-center">
        {t("searchResults.results")}
      </h2>
      <div className="order-3">{trashButton}</div>
    </div>
  );

  // Rendered in the sections' own place, inside the same card and behind the
  // same header, so a search in flight - or one that failed, or found
  // nothing - doesn't swap the whole layout out for a differently-sized one
  // and back again a moment later. Back and clear stay reachable throughout.
  // None of these three have a section (or an artist) to leave, so back stays
  // disabled unless one's already active - which the outer branches below
  // never are while loading, erroring, or turning up nothing.
  if (loading) {
    return (
      <FormContainer contentClassName="pb-2">
        {renderHeader(onBackClick, !!(loading || !activeArtist))}
        <LoadingState message={loadingMessage} />
      </FormContainer>
    );
  }

  if (error) {
    return (
      <FormContainer contentClassName="pb-2">
        {renderHeader(onBackClick, !activeArtist)}
        <div className="p-8 text-center text-foreground">{error}</div>
      </FormContainer>
    );
  }

  if (!hasResults) {
    return (
      <FormContainer contentClassName="pb-2">
        {renderHeader(onBackClick, !activeArtist)}
        <div className="p-8 text-center text-muted-foreground" data-cy="search-no-chord-sheets-found">
          {emptyMessage ?? t("searchResults.noResults")}
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

  // Reused by both the drilled-into section below and, one day, anywhere else
  // that needs a sort control scoped to whatever list is actually on screen.
  // Disabled while loading - nothing to sort while a different list is about
  // to replace this one.
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
        {renderHeader(onBackClick, !!loading)}
        <SearchResultsSection
          title={title}
          count={results.length}
          hideDivider
          open={artistSectionOpen}
          onOpenChange={setArtistSectionOpen}
        >
          {artistSectionOpen ? renderItems(results) : null}
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
  // Guards against a stale selection left over from a previous search whose
  // categories don't all still exist - falls back to the overview instead of
  // rendering nothing.
  const selectedSection = shown.find((section) => section.key === selectedKey) ?? null;

  return (
    <FormContainer contentClassName="pb-2">
      {/* activeArtist is always null down here - the branch above already
          returned if it wasn't - so back's only job left is leaving a
          selected section, and it's disabled without one. */}
      {renderHeader(selectedSection ? backToOverview : onBackClick, !selectedSection)}
      {selectedSection ? (
        <div className="flex w-full flex-col">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {selectedSection.title}
          </h3>
          {/* Marks off the title from the filter/sort row below it, the same
              rule as between two sections in the overview - just relocated,
              since this section no longer has any siblings to sit beside. */}
          <div
            className="mt-2 h-px bg-linear-to-r from-border/60 from-25% to-transparent"
            aria-hidden="true"
          />
          {/* Local to this section and to the one search already fetched it
              from - no network call, just narrowing what's already in memory. */}
          <div className="flex items-center gap-2 pb-3 pt-2">
            <Input
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              placeholder={t("searchResults.filterPlaceholder")}
              className="h-7 flex-1 bg-background text-xs"
              {...cyAttr("results-filter-input")}
            />
            {sortControl}
          </div>
          {renderItems(filterSearchHitsByText(selectedSection.items, sectionFilter))}
        </div>
      ) : (
        <div className="flex flex-col w-full gap-2">
          {shown.map((section, index) => (
            <SearchResultsSection
              key={section.key}
              title={section.title}
              count={section.items.length}
              hideDivider={index === shown.length - 1}
              open={false}
              onOpenChange={(next) => { if (next) selectSection(section.key); }}
            >
              {null}
            </SearchResultsSection>
          ))}
        </div>
      )}
    </FormContainer>
  );
};

export default SearchResultsLayout;
