
import { useState, useReducer, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import type { Song } from "@/types/song";
import type { Artist } from "@/types/artist";

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  myChordSheets: Song[];
  tabState: SearchFormState;
  setTabState: (state: SearchFormState) => void;
}

// Define the search form state
interface SearchFormState {
  artistQuery: string;         // Current artist input field value
  songQuery: string;           // Current song input field value
  selectedArtist: Artist | null; // The selected artist (if any)
  searchedArtist: string;      // Last submitted artist search term
  searchedSong: string;        // Last submitted song search term
  hasSearched: boolean;        // Whether a search has been performed
  shouldFetch: boolean;        // Whether to trigger API fetch
}

// Define actions
type SearchFormAction = 
  | { type: 'UPDATE_INPUT'; artistValue: string; songValue: string }
  | { type: 'SUBMIT_SEARCH'; artistValue: string; songValue: string }
  | { type: 'SELECT_ARTIST'; artist: Artist }
  | { type: 'BACK_TO_SEARCH' };

// Initial state
const initialState: SearchFormState = {
  artistQuery: "",
  songQuery: "",
  selectedArtist: null,
  searchedArtist: "",
  searchedSong: "",
  hasSearched: false,
  shouldFetch: false
};

// Reducer function
function searchFormReducer(state: SearchFormState, action: SearchFormAction): SearchFormState {
  switch (action.type) {
    case 'UPDATE_INPUT':
      return {
        ...state,
        artistQuery: action.artistValue,
        songQuery: action.songValue,
        shouldFetch: false // Reset shouldFetch on input changes
      };
    
    case 'SUBMIT_SEARCH':
      return {
        ...state,
        selectedArtist: null,
        searchedArtist: action.artistValue,
        searchedSong: action.songValue,
        hasSearched: true,
        shouldFetch: true // Set to true only when submitting search
      };
    
    case 'SELECT_ARTIST':
      return {
        ...state,
        selectedArtist: action.artist
      };
    
    case 'BACK_TO_SEARCH':
      return {
        ...state,
        selectedArtist: null,
        searchedSong: ""
      };
      
    default:
      return state;
  }
}


const SearchTab = ({ setMySongs, setActiveTab, setSelectedSong, myChordSheets, tabState, setTabState }: SearchTabProps) => {
  // Use reducer, but initialize from tabState if present
  const [state, dispatch] = useReducer(searchFormReducer, tabState || initialState);
  // Local loading state just for the search bar
  const [loading, setLoading] = useState(false);


  // Persist state to parent only on unmount/tab switch
  useEffect(() => {
    return () => {
      setTabState(state);
    };
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (artistValue: string, songValue: string) => {
    dispatch({ type: 'UPDATE_INPUT', artistValue, songValue });
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    setLoading(true);
    dispatch({ type: 'SUBMIT_SEARCH', artistValue, songValue });
    setLoading(false);
  };

  const handleArtistSelect = (artist: Artist) => {
    dispatch({ type: 'SELECT_ARTIST', artist });
  };

  const handleBackToSearch = () => {
    dispatch({ type: 'BACK_TO_SEARCH' });
  };

  return (
    <div className="space-y-4">
      <FormContainer>
        <SearchBar
          artistValue={state.artistQuery}
          songValue={state.songQuery}
          onInputChange={handleInputChange}
          onSearchSubmit={handleSearchSubmit}
          loading={loading}
          showBackButton={state.selectedArtist !== null}
          onBackClick={handleBackToSearch}
          isSearchDisabled={!state.artistQuery && !state.songQuery} // Disable search if both fields are empty
        />
      </FormContainer>
      <SearchResults
        setMySongs={setMySongs}
        setActiveTab={setActiveTab}
        setSelectedSong={setSelectedSong}
        myChordSheets={myChordSheets}
        artist={state.searchedArtist} // Always use searchedArtist
        song={state.searchedSong}    // Always use searchedSong
        filterArtist={state.artistQuery}
        filterSong={state.songQuery}
        activeArtist={state.selectedArtist}
        onArtistSelect={handleArtistSelect}
        hasSearched={state.hasSearched}
        shouldFetch={state.shouldFetch}
      />
    </div>
  );
};

export default SearchTab;
