import React from "react";

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

   // What was heard is submitted straight away: the reader has already said what
   // they wanted, so making them press search again would be asking twice.
   const voice = useVoiceSearch({
      onTranscript: (transcript) => {
         const query = tidyTranscript(transcript);
         handleInputChange(query);
         handleSearchSubmit(query);
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
      handleSearchSubmit(entry.query);
   }

   return (
      <div className="flex flex-col gap-4">
         <FormContainer>
            <SearchBar
               value={input}
               onInputChange={handleInputChange}
               onSearchSubmit={handleSearchSubmit}
               loading={loading}
               showBackButton={!!activeArtist}
               onBackClick={activeArtist ? handleBackToArtistList : undefined}
               isSearchDisabled={!input.trim()}
               onClearSearch={() => { handleClearSearch(); refresh(); }}
               clearDisabled={clearDisabled}
               voiceState={voice.state}
               onVoiceStart={voice.start}
               onVoiceStop={voice.stop}
            />
         </FormContainer>
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
               />
            </div>
         )}
      </div>
   );
};

export default SearchTab;
