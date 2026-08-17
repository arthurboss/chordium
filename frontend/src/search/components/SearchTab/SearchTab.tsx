import React, { useRef } from "react";

import FormContainer from "@/components/ui/FormContainer";
import SearchBar from "../SearchBar/SearchBar";
import { SearchResults } from "../SearchResults";
import SearchHistory from "../SearchHistory/SearchHistory";
import { cyAttr } from "@/utils/test-utils/cy-attr";
import { useSearchTabLogic } from "./hooks/useSearchTabLogic";
import { useSearchHistory, type SearchHistoryEntry } from "@/search/hooks/useSearchHistory";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { tidyTranscript } from "@/services/speech/tidy-transcript";

import type { SearchTabProps } from "./SearchTab.types";

const SearchTab: React.FC<SearchTabProps> = (props) => {
   const logic = useSearchTabLogic(props);
   const {
      activeArtist,
      loading,
      input,
      submittedQuery,
      artistFilter,
      clearDisabled,
      hasSearched,
      shouldFetch,
      handleBackToArtistList,
      handleArtistSelect,
      handleInputChange,
      handleSearchSubmit,
      handleLoadingChange,
      handleClearSearch,
      setShouldFetch,
      setMySongs,
      setActiveTab,
   } = logic;

   const { history, refresh } = useSearchHistory();

   // Wherever a search is submitted from - the button, Enter, voice, or
   // picking a past search - the reader's attention lands back on the search
   // bar rather than staying wherever the trigger happened to be, since that's
   // where the results this scroll is in service of start appearing from.
   const searchBarRef = useRef<HTMLDivElement>(null);
   function submitAndScrollToSearchBar(query: string) {
      handleSearchSubmit(query);
      searchBarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
   }

   // What was heard is submitted straight away: the reader has already said what
   // they wanted, so making them press search again would be asking twice.
   const voice = useVoiceSearch({
      onTranscript: (transcript) => {
         const query = tidyTranscript(transcript);
         handleInputChange(query);
         submitAndScrollToSearchBar(query);
      },
   });

   function handleHistorySelect(entry: SearchHistoryEntry) {
      refresh();
      if (entry.kind === "artist-songs") {
        handleArtistSelect({
          path: entry.query,
          displayName: entry.displayName || entry.query,
          songCount: null,
        });
        return;
      }
      handleInputChange(entry.query);
      submitAndScrollToSearchBar(entry.query);
   }

   return (
      <div className="flex flex-col gap-4">
         <div ref={searchBarRef}>
         <FormContainer>
            <SearchBar
               value={input}
               onInputChange={handleInputChange}
               onSearchSubmit={submitAndScrollToSearchBar}
               loading={loading}
               isSearchDisabled={!input.trim()}
               voiceState={voice.state}
               onVoiceStart={voice.start}
               onVoiceStop={voice.stop}
            />
         </FormContainer>
         </div>
         {!hasSearched && (
            <SearchHistory history={history} onSelect={handleHistorySelect} onClear={refresh} />
         )}
         {hasSearched && (
            <div {...cyAttr('search-results-area')}>
               <SearchResults
                  setMySongs={setMySongs}
                  setActiveTab={setActiveTab}
                  query={submittedQuery}
                  filter={artistFilter}
                  activeArtist={activeArtist}
                  onArtistSelect={handleArtistSelect}
                  shouldFetch={shouldFetch}
                  onLoadingChange={handleLoadingChange}
                  onFetchComplete={() => setShouldFetch(false)}
                  onBackClick={activeArtist ? handleBackToArtistList : undefined}
                  onClearSearch={() => { handleClearSearch(); refresh(); }}
                  clearDisabled={clearDisabled}
               />
            </div>
         )}
      </div>
   );
};

export default SearchTab;
