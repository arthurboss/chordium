import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";

const SearchTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Search Songs and Artists</h2>
      <FormContainer>
        <SearchBar searchType="dual" />
      </FormContainer>
      
      <div className="text-sm text-muted-foreground">
        <p>• To search for artists, fill in just the artist field</p>
        <p>• To search for songs, fill in just the song field</p>
        <p>• Fill in both fields to search for a specific song by an artist</p>
      </div>
    </div>
  );
};

export default SearchTab;
