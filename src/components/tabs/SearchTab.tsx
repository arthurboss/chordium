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
  const [inputArtist, setInputArtist] = useState("");
  const [inputSong, setInputSong] = useState("");
  const [activeArtist, setActiveArtist] = useState<Artist | null>(null);
  const [activeSong, setActiveSong] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (artistValue: string, songValue: string) => {
    setInputArtist(artistValue);
    setInputSong(songValue);
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    // Note: artistValue is not used here because inputArtist state is passed directly to SearchResults
    setLoading(true);
    // Clear the active artist but keep the input values for searching
    setActiveArtist(null);
    setActiveSong(songValue);
    // Simulate a short loading period
    setTimeout(() => setLoading(false), 300);
  };

  const handleArtistSelect = (artist: Artist) => {
    setActiveArtist(artist);
  };

  const handleBackToSearch = () => {
    setActiveArtist(null);
    setActiveSong("");
  };

  return (
    <div className="space-y-4">
      <FormContainer>
        <SearchBar
          onInputChange={handleInputChange}
          onSearchSubmit={handleSearchSubmit}
          loading={loading}
          showBackButton={activeArtist !== null}
          onBackClick={handleBackToSearch}
          isSearchDisabled={!inputArtist && !inputSong} // Disable search if both fields are empty
        />
      </FormContainer>
      <SearchResults
        setMySongs={setMySongs}
        setActiveTab={setActiveTab}
        artist={inputArtist}
        song={activeSong}
        filterArtist={inputArtist}
        filterSong={inputSong}
        activeArtist={activeArtist}
        onArtistSelect={handleArtistSelect}
        onBackToArtistList={handleBackToSearch}
      />
    </div>
  );
};

export default SearchTab;
