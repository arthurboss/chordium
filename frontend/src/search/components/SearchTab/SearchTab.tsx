import React from "react";

import FormContainer from "@/components/ui/FormContainer";
import SearchBar from "../SearchBar/SearchBar";
import { SearchResults } from "../SearchResults";
import { cyAttr } from "@/utils/test-utils/cy-attr";
import { useSearchTabLogic } from "./hooks/useSearchTabLogic";


import type { SearchTabProps } from "./SearchTab.types";

const SearchTab: React.FC<SearchTabProps> = (props) => {
   console.log('🔍 SearchTab: rendering with props:', props);
   
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

   console.log('🔍 SearchTab: logic state:', {
      activeArtist: activeArtist?.displayName,
      loading,
      artistInput,
      songInput,
      hasSearched,
      submittedArtist,
      submittedSong,
      shouldFetch
   });

   return (
      <div className="space-y-4">
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
               onClearSearch={handleClearSearch}
               clearDisabled={clearDisabled}
               artistDisabled={!!activeArtist}
            />
         </FormContainer>
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
