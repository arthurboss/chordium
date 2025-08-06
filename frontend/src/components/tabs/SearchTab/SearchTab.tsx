import React from "react";


import SongViewer from "@/components/SongViewer";
import FormContainer from "@/components/ui/FormContainer";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/search/components/SearchResults";
import { cyAttr } from "@/utils/test-utils/cy-attr";
import { useSearchTabLogic } from "./hooks/useSearchTabLogic";


import type { SearchTabProps } from "./search-tab.types";

const SearchTab: React.FC<SearchTabProps> = (props) => {
 const logic = useSearchTabLogic(props);
 const {
  selectedSongLocal,
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
  handleBackToSearch,
  handleBackToArtistList,
  handleSongSelect,
  handleArtistSelect,
  handleInputChange,
  handleSearchSubmit,
  handleLoadingChange,
  handleClearSearch,
  setShouldFetch,
  setMySongs,
  setActiveTab,
  // setSelectedSong
 } = logic;

 return (
  <div className="space-y-4">
   {selectedSongLocal ? (
    <SongViewer
     song={{
      song: selectedSongLocal,
      chordSheet: {
       title: selectedSongLocal.title || '',
       artist: selectedSongLocal.artist || '',
       songChords: '',
       songKey: '',
       guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'] as const,
       guitarCapo: 0
      }
     }}
     chordDisplayRef={null}
     onBack={handleBackToSearch}
     onDelete={() => { }}
     onUpdate={() => { }}
     hideDeleteButton={true}
    />
   ) : (
    <>
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
        setSelectedSong={handleSongSelect}
        artist={hasSearched ? submittedArtist : searchState.artist}
        song={hasSearched ? submittedSong : searchState.song}
        filterArtist={activeArtist ? submittedArtist : artistInput}
        filterSong={songInput}
        activeArtist={activeArtist}
        onArtistSelect={handleArtistSelect}
        hasSearched={hasSearched}
        shouldFetch={shouldFetch}
        onLoadingChange={handleLoadingChange}
        onFetchComplete={() => setShouldFetch(false)}
       />
      </div>
     )}
    </>
   )}
  </div>
 );
};

export default SearchTab;
