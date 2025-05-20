import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const hasSearchQuery = searchParams.has("artist") || searchParams.has("song");
  const [artistLoading, setArtistLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  return (
    <div className="space-y-6">
      <FormContainer>
        <SearchBar artistLoading={artistLoading} loading={searchLoading} />
      </FormContainer>
      {hasSearchQuery && (
        <SearchResults
          setMySongs={setMySongs}
          setActiveTab={setActiveTab}
          artistLoading={artistLoading}
          setArtistLoading={setArtistLoading}
          onLoadingChange={setSearchLoading}
        />
      )}
    </div>
  );
};

export default SearchTab;
