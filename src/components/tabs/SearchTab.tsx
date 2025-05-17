import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";
import SearchResults from "@/components/SearchResults";
import { SearchLoadingProvider } from "@/context/SearchLoadingProvider";
import { SongData } from "@/types/song";

interface SearchTabProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
}

const SearchTab = ({ setMySongs, setActiveTab }: SearchTabProps) => {
  const [searchParams] = useSearchParams();
  // Check for artist or song parameters in the URL
  const hasSearchQuery = searchParams.has("artist") || searchParams.has("song");

  return (
    <div className="space-y-6">
      <SearchLoadingProvider>
        <FormContainer>
          <SearchBar searchType="dual" />
        </FormContainer>
        
        {hasSearchQuery && (
          <SearchResults 
            setMySongs={setMySongs}
            setActiveTab={setActiveTab}
          />
        )}
      </SearchLoadingProvider>
    </div>
  );
};

export default SearchTab;
