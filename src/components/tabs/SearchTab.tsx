import SearchBar from "@/components/SearchBar";
import FormContainer from "@/components/ui/FormContainer";

const SearchTab = () => {
  return (
    <div className="space-y-6">
      <FormContainer>
        <SearchBar searchType="dual" />
      </FormContainer>
    </div>
  );
};

export default SearchTab;
