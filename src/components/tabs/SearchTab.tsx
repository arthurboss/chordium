import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import { SongData } from "@/types/song";

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchTab = ({ setMySongs, setActiveTab }: SearchTabProps) => {
  const [inputArtist, setInputArtist] = useState("");
  const [inputSong, setInputSong] = useState("");
  const [activeArtist, setActiveArtist] = useState("");
  const [activeSong, setActiveSong] = useState("");

  const handleInputChange = (artistValue: string, songValue: string) => {
    setInputArtist(artistValue);
    setInputSong(songValue);
  };

  const handleSearchSubmit = (artistValue: string, songValue: string) => {
    setActiveArtist(artistValue);
    setActiveSong(songValue);
  };

  return (
    <div className="space-y-4">
      <FormContainer>
        <SearchBar
          onInputChange={handleInputChange}
          onSearchSubmit={handleSearchSubmit}
        />
      </FormContainer>
      <SearchResults
        setMySongs={setMySongs}
        setActiveTab={setActiveTab}
        artist={activeArtist}
        song={activeSong}
        filterArtist={inputArtist}
        filterSong={inputSong}
      />
    </div>
  );
};

export default SearchTab;
