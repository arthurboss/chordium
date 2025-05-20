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
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");

  // Handler for instant search filtering
  const handleSearchChange = (artistValue: string, songValue: string) => {
    setArtist(artistValue);
    setSong(songValue);
  };

  return (
    <div className="space-y-6">
      <FormContainer>
        <SearchBar onSearchChange={handleSearchChange} />
      </FormContainer>
      <SearchResults
        setMySongs={setMySongs}
        setActiveTab={setActiveTab}
        artist={artist}
        song={song}
      />
    </div>
  );
};

export default SearchTab;
