import React from "react";

import FormContainer from "@/components/ui/FormContainer";
import SearchBar from "../SearchBar/SearchBar";
import { SearchResults } from "../SearchResults";
import SearchHistory from "../SearchHistory/SearchHistory";
import { cyAttr } from "@/utils/test-utils/cy-attr";
import { useSearchTabLogic } from "./hooks/useSearchTabLogic";
import { useSearchHistory } from "@/search/hooks/useSearchHistory";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { parseVoiceQuery } from "@/services/speech/parse-voice-query";
import { useTranslation } from "react-i18next";

import type { SearchTabProps } from "./SearchTab.types";

const SearchTab: React.FC<SearchTabProps> = (props) => {
   const logic = useSearchTabLogic(props);
   const {
      activeArtist,
      loading,
      artistInput,
      songInput,
      clearDisabled,
      hasSearched,
      searchState,
      submittedArtist,
      submittedSong,
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
   const { i18n } = useTranslation();

   // What was heard is submitted straight away: the reader has already said what
   // they wanted, so making them press search again would be asking twice.
   const voice = useVoiceSearch({
      onTranscript: (transcript) => {
         const { artist, song } = parseVoiceQuery(transcript, i18n.resolvedLanguage);
         handleInputChange(artist, song);
         handleSearchSubmit(artist, song);
      },
   });

   function handleHistorySelect(artist: string, song: string, searchType: string, displayName: string) {
      refresh();
      if (searchType === "artist-song") {
        handleArtistSelect({ path: artist, displayName: displayName || artist, songCount: null });
      } else {
        handleInputChange(artist, song);
        handleSearchSubmit(artist, song);
      }
   }

   return (
      <div className="flex flex-col gap-4">
         <FormContainer>
            <SearchBar
               artistValue={artistInput}
               songValue={songInput}
               onInputChange={handleInputChange}
               onSearchSubmit={handleSearchSubmit}
               loading={loading}
               showBackButton={!!activeArtist}
               onBackClick={activeArtist ? handleBackToArtistList : undefined}
               isSearchDisabled={!artistInput && !songInput}
               artistLoading={loading}
               onClearSearch={() => { handleClearSearch(); refresh(); }}
               clearDisabled={clearDisabled}
               artistDisabled={!!activeArtist}
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
                  artist={hasSearched ? submittedArtist : searchState.query.artist}
                  song={hasSearched ? submittedSong : searchState.query.song}
                  filterArtist={activeArtist ? submittedArtist : artistInput}
                  filterSong={songInput}
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
