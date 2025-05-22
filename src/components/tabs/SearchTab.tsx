import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import { SongData } from "@/types/song";
import { Artist } from "@/types/artist";

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchTab = ({ setMySongs, setActiveTab }: SearchTabProps) => {
  // Current text in the artist search input field - changes with every keystroke
  const [artistQuery, setArtistQuery] = useState("");
  // Current text in the song search input field - changes with every keystroke
  const [songQuery, setSongQuery] = useState("");
  // The full Artist object when a user selects a specific artist from search results
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  // The song search term that was submitted for search (not changing with keystrokes)
  const [searchedSong, setSearchedSong] = useState("");
  // Loading state while searching or fetching data
  const [loading, setLoading] = useState(false);

  const handleInputChange = (artistValue: string, songValue: string) => {
    setArtistQuery(artistValue);
    setSongQuery(songValue);
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    // Note: artistValue is not used here because artistQuery state is passed directly to SearchResults
    setLoading(true);
    // Clear the selected artist but keep the input values for searching
    setSelectedArtist(null);
    setSearchedSong(songValue);
    // Simulate a short loading period
    setTimeout(() => setLoading(false), 300);
  };

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleBackToSearch = () => {
    setSelectedArtist(null);
    setSearchedSong("");
  };

  return (
    <div className="space-y-4">
      <FormContainer>
        <SearchBar
          artistValue={artistQuery}
          songValue={songQuery}
          onInputChange={handleInputChange}
          onSearchSubmit={handleSearchSubmit}
          loading={loading}
          showBackButton={selectedArtist !== null}
          onBackClick={handleBackToSearch}
          isSearchDisabled={!artistQuery && !songQuery} // Disable search if both fields are empty
        />
      </FormContainer>
      <SearchResults
        setMySongs={setMySongs}
        setActiveTab={setActiveTab}
        artist={artistQuery}
        song={searchedSong}
        filterArtist={artistQuery}
        filterSong={songQuery}
        activeArtist={selectedArtist}
        onArtistSelect={handleArtistSelect}
        onBackToArtistList={handleBackToSearch}
      />
    </div>
  );
};

export default SearchTab;
